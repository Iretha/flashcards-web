import { expect, it } from 'vitest';
import { parseMarkdown } from '../src/lib/markdown';
import { validateMetadata } from '../src/lib/metadata';
import { advance, defaults, startStudy } from '../src/lib/study';

import { v3Fixture } from './fixtures/v3';

it('parses mixed types, BG/EN, prompt code and distinct interview evidence', () => {
  const parsed = parseMarkdown(v3Fixture);
  expect(parsed.version).toBe(3);
  expect(parsed.cards).toHaveLength(2);
  const card = parsed.cards[0];
  expect(card).not.toHaveProperty('error');
  expect(card).toMatchObject({ key: 'task', metadata: { cardType: 'coding_task', occurrenceCount: 1, provenance: { sources: expect.any(Array) } } });
  if ('translations' in card) {
    expect(card.translations.bg?.questionDetails).toContain('// ### en');
    expect(card.translations.en?.questionDetails).toContain('int count = 0;');
    expect(card.translations.en?.questionDetails).not.toContain('AtomicInteger');
    expect(card.metadata?.provenance.sources).toHaveLength(3);
  }
});

it.each([
  ['https://example.com/interview', 'javascript:alert(1)', 'sourceUrl'],
  ["'2026-11-21'", "'2026-02-30'", 'publishedAt'],
  ['cardType: coding_task', 'cardType: unknown', 'cardType'],
  ['occurrenceCount: 1', 'occurrenceCount: -1', 'occurrenceCount'],
  ['occurrenceCount: 1', 'occurrenceCount: 3', 'occurrenceCount'],
  ['occurrenceCount: 1', 'occurrenceCount: 1.5', 'occurrenceCount'],
])('reports card and field for invalid %s', (from, to, field) => {
  const card = parseMarkdown(v3Fixture.replace(from, to)).cards[0];
  expect(card).toHaveProperty('error', expect.stringContaining(field));
  expect(card).toHaveProperty('error', expect.stringContaining('task'));
});

it('requires source evidence and permits generated cards with zero occurrences', () => {
  expect(validateMetadata({ cardType: 'question', topic: 'Java', provenance: { type: 'generated' } }).provenance.sources).toEqual([]);
  expect(() => validateMetadata({ cardType: 'question', topic: 'Java', provenance: { type: 'sourced' } })).toThrow('provenance.sources');
});

it.each([
  ['### topic: Java', '### topic: Java\n### topic: JVM', 'topic'],
  ['### topic: Java', '### difficulty: 6\n### topic: Java', 'difficulty'],
  ['#### answer\nUse AtomicInteger.', '#### answer\nUse AtomicInteger.\n#### example\nSeparate example', 'example'],
  ['#### question\nImplement a counter.', '#### question\n', 'en.question'],
  ['## card: question', '## card: task', 'id'],
])('rejects ambiguous or incomplete v3 content', (from, to, field) => {
  const cards = parseMarkdown(v3Fixture.replace(from, to)).cards;
  expect(cards.some(card => 'error' in card && card.error?.includes(field))).toBe(true);
});

it('toggles answer and expires without moving or changing repeat membership', () => {
  let state = startStudy([{ id: 'a' }], defaults, 0);
  state = advance(state, defaults, 'show', 1).state;
  expect(state.revealed).toBe(true);
  state = advance(state, defaults, 'show', 2).state;
  expect(state.revealed).toBe(false);
  expect(state.current).toBe('a');
  expect(state.cycles?.repeat).toEqual([]);
});

it('removes unchecked pending repeat cards and can add a historical card in a later cycle', () => {
  const config = { ...defaults, timer: false };
  let state = startStudy(['a', 'b', 'c'].map(id => ({ id })), config, 0);
  const act = (action: Parameters<typeof advance>[2]) => { state = advance(state, config, action, 0).state; };
  act('repeat'); act('next'); act('repeat'); act('next');
  expect(state.current).toBe('c');
  act('next'); expect(state.current).toBe('a');
  act('previous'); act('previous'); expect(state.history[state.cursor]).toBe('b');
  act('repeat'); // remove pending b
  act('previous'); act('repeat'); // remove a
  act('next'); act('next'); act('repeat'); // mark historical c
  act('next'); act('next');
  expect(state.current).toBe('c');
  expect(state.cycles?.repeat).toEqual(['c']);
  act('repeat'); act('next');
  expect(state.current).toBeNull();
});
