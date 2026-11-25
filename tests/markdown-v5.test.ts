import { expect, it } from 'vitest';
import { parseMarkdown } from '../src/lib/markdown';
import { planImport } from '../src/server/import-plan';
import type { ImportTarget } from '../src/server/import-plan';
import { validateCanonicalMetadata } from '../src/lib/metadata';

const source = (metadata = '', content = '### en\n#### question\nQuestion') => `---\nformatVersion: 5\nprimaryLanguage: en\n---\n## card: stable\n${metadata}\n${content}`;
const current = (): ImportTarget => ({ id: 'same', import_key: 'stable', primary_language: 'en', interview_priority: 5, difficulty: 4,
  translations: { en: { question: 'Question', answer: 'Retain', questionDetails: 'Task statement' }, bg: { question: 'Въпрос', answer: 'Отговор', questionDetails: 'Условие' } },
  canonical: { topics: ['Java'], priority: 1, likelihood: 2, creation_mode: 'AI', metadata: validateCanonicalMetadata({ cardType: 'task', provenance: { type: 'generated', sources: [] }, answerReferences: [{ title: 'Reference', url: 'https://example.com' }] }) },
});
it('F-001 distinguishes absent details from an explicit empty section while preserving omissions', () => {
  const existing = current();
  existing.canonical!.metadata = validateCanonicalMetadata({ cardType: 'question' });
  delete existing.translations.en.questionDetails;
  const omitted = parseMarkdown(source());
  expect(planImport(omitted, [existing], {}, {}).changed).toEqual([]);
  const explicit = parseMarkdown(source('', '### en\n#### question\nQuestion\n#### questionDetails'));
  const preview = planImport(explicit, [existing], {}, {});
  expect(preview.rows.find(row => row.language === 'en')?.kind).toBe('conflict');
  expect(planImport(explicit, [existing], {}, { '0:en': 'keep' }).changed).toEqual([]);
  const applied = planImport(explicit, [existing], {}, { '0:en': 'update' });
  expect(applied.changed[0].translations.en.questionDetails).toBe('');
  expect(planImport(explicit, applied.cards, {}, {}).changed).toEqual([]);
  expect(planImport(omitted, applied.cards, {}, {}).cards[0].translations.en).toHaveProperty('questionDetails', '');
});
it.each(['### provenance\nnull', '### answerReferences\n[]', '### cardType: task', '### provenance\ntype: generated\nsources: []'])('F-002 accepts partial metadata and preserves omitted task metadata: %s', metadata => {
  const existing = current();
  const parsed = parseMarkdown(source(metadata));
  expect(parsed.cards[0].error).toBeUndefined();
  const plan = planImport(parsed, [existing], {}, {});
  expect(plan.rows.some(row => row.kind === 'invalid')).toBe(false);
  const result = plan.cards[0].canonical!.metadata;
  expect(result.cardType).toBe('task');
  if (!metadata.startsWith('### provenance')) expect(result.provenance).toEqual(existing.canonical!.metadata.provenance);
  if (!metadata.startsWith('### answerReferences')) expect(result.answerReferences).toEqual(existing.canonical!.metadata.answerReferences);
});
it('creates defaults and preserves all omitted fields, languages and legacy raw values on patch', () => {
  const created = planImport(parseMarkdown('\uFEFF' + source()), [], {}, {}).changed[0];
  expect(created.canonical).toMatchObject({ topics: [], priority: 3, likelihood: 3, creation_mode: 'UNKNOWN', metadata: { cardType: 'question' } });
  expect(created.translations.en.answer).toBe('');
  const existing = current();
  const plan = planImport(parseMarkdown(source()), [existing], {}, {});
  expect(plan.rows.every(row => row.kind === 'duplicate')).toBe(true);
  expect(plan.changed).toEqual([]);
  expect(plan.cards[0]).toEqual(existing);
});
it('patches classifications, explicit clears and type transitions without losing retained translations', () => {
  const plan = planImport(parseMarkdown(source('### topics\n[]\n### priority: null\n### likelihood: null\n### creationMode:\n### difficulty: null\n### provenance\nnull\n### answerReferences\n[]\n### cardType: question', '### en\n#### question\nQuestion\n#### questionDetails\n#### answer')), [current()], {}, { '0:en': 'update' });
  const card = plan.changed[0];
  expect(card).toMatchObject({ id: 'same', interview_priority: 5, difficulty: null, canonical: { topics: [], priority: 3, likelihood: 3, creation_mode: 'UNKNOWN', metadata: { cardType: 'question', answerReferences: [] } }, translations: { en: { answer: '', questionDetails: '' }, bg: { questionDetails: 'Условие' } } });
  expect(card.canonical?.metadata).not.toHaveProperty('provenance');
  expect(plan.rows.find(row => row.classificationChange)?.classificationChange?.after).toEqual(card.canonical);
});
it('validates tasks against the chosen final state including omitted languages', () => {
  const existing = current(); existing.canonical!.metadata = validateCanonicalMetadata({ cardType: 'question' });
  existing.translations.bg.questionDetails = '';
  expect(planImport(parseMarkdown(source('### cardType: task')), [existing], {}, {}).rows.some(row => row.kind === 'invalid')).toBe(true);
  expect(planImport(parseMarkdown(source('### cardType: task')), [], {}, {}).rows.some(row => row.kind === 'invalid')).toBe(true);
  const valid = current();
  const input = parseMarkdown(source('', '### en\n#### question\nQuestion\n#### questionDetails'));
  expect(planImport(input, [valid], {}, { '0:en': 'keep' }).rows.some(row => row.kind === 'invalid')).toBe(false);
  expect(planImport(input, [valid], {}, { '0:en': 'update' }).rows.some(row => row.kind === 'invalid')).toBe(true);
});
it.each(['### topics\nnull', '### topics\n[""]', '### priority:', '### priority: 0', '### likelihood: "3"', '### cardType:', '### creationMode: HUMAN', '### occurrenceCount: 1', '### priority: 1\n### priority: 2', '### provenance\ntype: generated\nsources: [{sourceName: Test, sourceUrl: https://example.com, unsupported: true}]', '### topics\n[!executable test]', '### topics\n- &x Test\n- *x', '### difficulty:', '### answerReferences\nnull'])('rejects invalid authored metadata: %s', metadata => {
  expect(parseMarkdown(source(metadata)).cards[0].error).toBeTruthy();
});
it('rejects unsafe and unsupported frontmatter and content before cards', () => {
  for (const field of ['settings: {}', 'formatVersion: 5', 'title: !executable test', 'title: &x test\ndescription: *x', 'primaryLanguage: 2']) expect(() => parseMarkdown(source().replace('primaryLanguage: en', field))).toThrow();
  expect(() => parseMarkdown(source().replace('## card: stable', 'Unexpected\n## card: stable'))).toThrow();
});
it('normalizes supplied topics and enforces limits after deduplication', () => {
  expect(parseMarkdown(source('### topics\n[Java, " java ", "café", "café"]')).cards[0].canonical?.topics).toEqual(['CAFÉ', 'JAVA']);
  for (const topics of [Array.from({ length: 11 }, (_, i) => String(i)), ['x'.repeat(201)]]) expect(parseMarkdown(source('### topics\n' + JSON.stringify(topics))).cards[0].error).toBeTruthy();
});
it('preserves fenced reserved headings and rejects duplicate languages and fields', () => {
  const content = '### en\n#### question\nQuestion\n#### answer\n~~~md\n## card: literal\n### priority: 1\n#### answer\n~~~';
  expect(parseMarkdown(source('', content)).cards[0].translations.en.answer).toContain('### priority: 1');
  for (const extra of ['\n### en\n#### question\nOther', '\n#### question\nOther', '\n### priority: 1', '\n#### simple\nRetired', '\n### topics\n[]']) expect(parseMarkdown(source('', content + extra)).cards[0].error).toBeTruthy();
});
