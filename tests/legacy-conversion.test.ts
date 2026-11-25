import { expect, it } from 'vitest';
import { convertLegacyMarkdown } from '../src/lib/legacy-conversion';
import { parseMarkdown } from '../src/lib/markdown';
const source = `---
formatVersion: 4
primaryLanguage: en
---
## card: a
### cardType: question
### topic: SQL; JDBC
### interviewPriority: 5
### provenance
type: generated
sources: []
### en
#### question
Question?
#### answer
`;
it('preserves scalar topics, empty answers and reports omitted raw priority', () => {
 const result = convertLegacyMarkdown(source);
 const card = parseMarkdown(result.markdown).cards[0];
 expect(card.error).toBeUndefined();
 expect(card.canonical?.topics).toEqual(['SQL; JDBC']);
 expect(card.translations.en.answer).toBe('');
 expect(planImport(parseMarkdown(result.markdown), [], {}, {}).cards[0].canonical).toMatchObject({ priority: 3, likelihood: 3, creation_mode: 'UNKNOWN' });
 expect(result.diagnostics[0]).toContain('value 5');
 expect(() => convertLegacyMarkdown(result.markdown)).toThrow('Already v5');
});
it('blocks unsupported metadata without dropping it', () => {
 expect(() => convertLegacyMarkdown(source.replace('### topic:', '### unknown:'))).toThrow('unsupported');
});

import { planImport } from '../src/server/import-plan';
import type { ImportTarget } from '../src/server/import-plan';
import { validateCanonicalMetadata } from '../src/lib/metadata';

it('preserves omitted/empty fields through normal preview and reimport, retaining raw legacy and identity', () => {
 const input = source.replace('#### answer\n', '');
 const converted = parseMarkdown(convertLegacyMarkdown(input).markdown);
 expect(converted.cards[0].translations.en).not.toHaveProperty('answer');
 expect(converted.cards[0].canonical).not.toHaveProperty('difficulty');
 expect(converted.cards[0].canonical).not.toHaveProperty('likelihood');
 expect(converted.cards[0].canonical).not.toHaveProperty('creationMode');
 const existing: ImportTarget = { id: 'retained', import_key: 'a', primary_language: 'en', interview_priority: 5, difficulty: 4,
   translations: { en: { question: 'Question?', answer: 'Keep', questionDetails: 'Details' }, bg: { question: 'Въпрос?', answer: 'Запази' } },
   canonical: { topics: ['BEFORE'], priority: 1, likelihood: 2, creation_mode: 'MANUAL', metadata: validateCanonicalMetadata({ cardType: 'question', answerReferences: [{title: 'Old', url: 'https://example.com'}] }) } };
 const plan = planImport(converted, [existing], {}, {});
 expect(plan.rows.some(row => row.kind === 'invalid')).toBe(false);
 expect(plan.cards[0]).toMatchObject({ id: 'retained', import_key: 'a', interview_priority: 5, difficulty: 4, canonical: { priority: 3, likelihood: 2, creation_mode: 'MANUAL', metadata: { answerReferences: [] } }, translations: existing.translations });
 expect(planImport(converted, plan.cards, {}, {}).changed).toEqual([]);
 const clear = planImport(parseMarkdown(convertLegacyMarkdown(source).markdown), [existing], {}, { '0:en': 'update' });
 expect(clear.cards[0].translations.en.answer).toBe('');
 expect(clear.cards[0].translations.en.questionDetails).toBe('Details');
});

it('retains every source property and reference, v3 count evidence, task details and multilingual fenced content', () => {
 const evidence = `type: mixed
sources:
- sourceName: Interview report (adapted; not reverified)
  sourceUrl: https://example.com/report
  company: Company
  location: Sofia
  interviewLocation: Remote
  publishedAt: '2025-01-02'
  occurrenceId: event-1
- sourceName: Repost
  sourceUrl: https://example.com/repost
  occurrenceId: event-1`;
 const input = source.replace('formatVersion: 4', 'formatVersion: 3').replace('### cardType: question', '### occurrenceCount: 1\n### difficulty: 4\n### cardType: coding_task').replace('type: generated\nsources: []', evidence).replace('### en', '### answerReferences\n- title: Technical answer reference\n  url: https://example.com/answer\n### en').replace('#### answer\n', '#### questionDetails\nTask statement\n#### answer\n```markdown\n## card: literal\n### topic: literal\n#### answer\n```\n') + '### bg\n#### question\nЗадача?\n#### questionDetails\nУсловие\n#### answer\n';
 const before = parseMarkdown(input).cards[0];
 const result = convertLegacyMarkdown(input);
 const after = parseMarkdown(result.markdown).cards[0];
 expect(after.translations).toEqual(before.translations);
 expect(after.canonical?.metadata).toEqual({ cardType: 'task', provenance: before.legacyMetadata?.provenance, answerReferences: before.legacyMetadata?.answerReferences });
 expect(after.canonical?.difficulty).toBe(4);
 expect(result.diagnostics.some(value => value.includes('occurrenceCount: validated 1'))).toBe(true);
 expect(result.markdown).not.toContain('### occurrenceCount');
 expect(planImport(parseMarkdown(result.markdown), [], {}, {}).rows.some(row => row.kind === 'invalid')).toBe(false);
});

it('does not invent a sources field when the authored generated provenance omits it', () => {
 const converted = parseMarkdown(convertLegacyMarkdown(source.replace('\nsources: []', '')).markdown);
 expect(converted.cards[0].canonical?.metadata?.provenance).toEqual({ type: 'generated' });
});

it.each([
 ['unknown frontmatter', source.replace('formatVersion: 4', 'formatVersion: 4\ncustom: keep')],
 ['invalid frontmatter type', source.replace('primaryLanguage: en', 'primaryLanguage: 5')],
 ['unsupported format', source.replace('formatVersion: 4', 'formatVersion: 2')],
 ['unknown source property', source.replace('type: generated\nsources: []', 'type: sourced\nsources: [{ sourceName: Source, sourceUrl: https://example.com, qualifier: keep }]')],
 ['invalid v3 count', source.replace('formatVersion: 4', 'formatVersion: 3').replace('### topic:', '### occurrenceCount: 1\n### topic:')],
 ['historical contradiction', source.replace('formatVersion: 4', 'formatVersion: 3').replace('### topic:', '### occurrenceCount: 1\n### topic:').replace('sources: []', 'sources: [{ sourceName: Evidence, sourceUrl: https://example.com, occurrenceId: event }]')],
 ['invalid task', source.replace('cardType: question', 'cardType: coding_task')],
 ['preamble content', source.replace('## card:', 'Notes to preserve\n## card:')],
 ['inline YAML body', source.replace('### provenance', '### provenance: ignored')],
 ['alias YAML', source.replace('sources: []', 'sources: &s []\nextra: *s')],
 ['custom YAML tag', source.replace('type: generated', 'type: !execute generated')],
 ['invalid heading placement', source + '### difficulty: 4\n'],
 ['duplicate key', source + source.slice(source.indexOf('## card:'))],
])('blocks %s instead of silently discarding data', (_name, input) => {
 expect(() => convertLegacyMarkdown(input)).toThrow();
});

it.each([
 ['primaryLanguage: en', 'primaryLanguage: en-us'],
 ['primaryLanguage: en', 'primaryLanguage: en\nsupportedLanguages: [bg]'],
 ['primaryLanguage: en', 'primaryLanguage: en\nsupportedLanguages: [en, en]'],
 ['primaryLanguage: en', 'primaryLanguage: en\nvisibility: PUBLIC'],
 ['primaryLanguage: en', `primaryLanguage: en\ntitle: ${'x'.repeat(161)}`],
])('validates retained deck declarations: %s -> %s', (from, to) => {
 expect(() => convertLegacyMarkdown(source.replace(from, to))).toThrow('frontmatter.');
});

it('reports errors across all invalid cards', () => {
 const input = source.replace('cardType: question', 'cardType: invalid') + source.slice(source.indexOf('## card:')).replace('card: a', 'card: b').replace('cardType: question', 'cardType: invalid');
 try { convertLegacyMarkdown(input); throw new Error('Expected source validation failure'); }
 catch (error) { expect(String(error)).toContain('Card a'); expect(String(error)).toContain('Card b'); }
});

it('enforces conversion size/card limits and identifies topic failures by key', () => {
 expect(() => convertLegacyMarkdown('x'.repeat(10_000_001))).toThrow('10 MB');
 const header = source.slice(0, source.indexOf('## card:'));
 const body = source.slice(source.indexOf('## card:'));
 expect(() => convertLegacyMarkdown(header + Array.from({ length: 1001 }, (_, i) => body.replace('card: a', 'card: a' + i)).join('\n'))).toThrow('1 and 1000');
 expect(() => convertLegacyMarkdown(source.replace('SQL; JDBC', 'a'.repeat(201)))).toThrow('Card a');
});
