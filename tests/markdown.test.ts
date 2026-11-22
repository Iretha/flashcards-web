import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { compareImport, parseMarkdown, questionKey } from '../src/lib/markdown';

it('reads frontmatter and preserves multiline lists, Markdown, and fences', () => {
  const markdown = [
    '---', 'deckId: memory-model', 'title: "Memory: model"', '---', '',
    '## Question?', '', '- **A**', '- B', '````md', '---', '## in code', '```', '````', '---',
    '## Another ###', '~~~', '---', '~~~',
  ].join('\n');
  const result = parseMarkdown(markdown.replace(/\n/g, '\r\n'));
  expect(result.metadata).toEqual({ deckId: 'memory-model', title: 'Memory: model' });
  expect(result.cards).toEqual([
    { question: 'Question?', answer: '- **A**\n- B\n````md\n---\n## in code\n```\n````' },
    { question: 'Another', answer: '~~~\n---\n~~~' },
  ]);
});

it('normalizes Unicode, case and whitespace while reporting conflicts and invalid cards', () => {
  const result = compareImport([
    { question: '  ＴＥＳＴ\t card ', answer: 'Same' },
    { question: 'test card', answer: 'Updated' },
    { question: 'test CARD', answer: 'Updated' },
    { question: 'other', answer: 'New' },
    { question: '  ', answer: 'Invalid' },
  ], [{ id: 'a', question_key: questionKey('Test card'), question: 'Test card', answer: 'Same' }]);
  expect(result.map(row => row.kind)).toEqual(['duplicate', 'conflict', 'duplicate', 'new', 'invalid']);
  expect(result[1].existingAnswer).toBe('Same');
});

it('parses two v2 languages as one card and preserves reserved headings inside fences', () => {
  const content = [
    '---', 'deckId: test', 'formatVersion: 2', '---',
    '## card: one', '### bg', '#### question', 'Въпрос?', '#### answer', '**Да**.',
    '#### example', '~~~md', '## card: ignored', '---', '### en', '#### answer', '~~~',
    '## Extra context', 'More text', '### en', '#### question', 'Question?', '#### answer', 'Answer.',
    '---', '## card: invalid', '### en', '#### question', 'Missing answer?',
  ].join('\n');
  const parsed = parseMarkdown(content);
  expect(parsed.version).toBe(2);
  expect(parsed.cards).toHaveLength(2);
  expect(parsed.cards[0]).toMatchObject({
    key: 'one', translations: {
      bg: { question: 'Въпрос?', answer: '**Да**.', example: '~~~md\n## card: ignored\n---\n### en\n#### answer\n~~~\n## Extra context\nMore text' },
      en: { question: 'Question?', answer: 'Answer.' },
    },
  });
  expect(parsed.cards[1]).not.toHaveProperty('error');
  expect(parsed.cards[1]).toMatchObject({ translations: { en: { answer: '' } } });
});

it('keeps the documented v1 and v3 examples importable', () => {
  const template = readFileSync(new URL('../docs/FLASHCARDS-IMPORT-TEMPLATE.md', import.meta.url), 'utf8');
  const specification = readFileSync(new URL('../docs/PROJECT-SPECIFICATION.md', import.meta.url), 'utf8');
  const legacy = /^`{3}md\r?\n([\s\S]*?)^`{3}$/m.exec(specification)?.[1] ?? '';
  const first = parseMarkdown(template);
  expect(first.version).toBe(3);
  expect(first.cards).toHaveLength(4);
  expect(first.cards[0]).toEqual(expect.objectContaining({ key: 'volatile-atomicity', translations: {
    bg: expect.objectContaining({ answer: expect.stringContaining('volatile int count') }),
    en: expect.objectContaining({ answer: expect.stringContaining('AtomicInteger') }),
  } }));
  const old = parseMarkdown(legacy);
  expect(old.version).toBe(1);
  expect(old.cards).toHaveLength(2);
});

it('preserves horizontal rules within legacy answers', () => {
  expect(parseMarkdown('## First\n\nOne\n\n---\n\nTwo\n\n---\n\n## Second\n\nThree').cards)
    .toEqual([{ question: 'First', answer: 'One\n\n---\n\nTwo' }, { question: 'Second', answer: 'Three' }]);
});

it('rejects invalid and repeated ratings', () => {
  const language = '\n### en\n#### question\nQuestion?\n#### answer\nAnswer.';
  for (const metadata of ['### difficulty: 0', '### interviewPriority: 1.5', '### difficulty: 2\n### difficulty: 3']) {
    const parsed = parseMarkdown('---\nformatVersion: 2\n---\n## card: test\n' + metadata + language);
    expect(parsed.cards[0]).toHaveProperty('error');
  }
});


it('accepts omitted and empty answers in v2 and v3 while retaining question validation', () => {
  for (const version of [2,3]) {
    const metadata = version === 3 ? '\n### cardType: question\n### topic: Java\n### occurrenceCount: 0\n### provenance\ntype: generated\nsources: []' : '';
    for (const answer of ['', '\n#### answer\n   ']) {
      const source = '---\nformatVersion: '+version+'\n---\n## card: empty'+metadata+'\n### en\n#### question\nQuestion?'+answer;
      const parsed = parseMarkdown(source);
      expect(parsed.cards[0]).not.toHaveProperty('error');
      expect(parsed.cards[0]).toMatchObject({translations:{en:{question:'Question?',answer:''}}});
    }
  }
});
