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
