import { describe, expect, it } from 'vitest';
import {
  applyClassificationPatch, classificationComparator, classificationLabels, compareUnicodeScalars,
  matchesClassification, normalizeTopic, normalizeTopics, ratings, validateClassificationCreate,
  validateClassificationFilters, validateClassificationSort, validateCreationMode, validateRating,
  type CanonicalCardState, type ClassificationFilters, type SortableClassification,
} from '../src/lib/classification';
import { derivedMetadata, metadataForStorage, validateCanonicalMetadata } from '../src/lib/metadata';
import { completeTranslation } from '../src/lib/translations';

const translation = { question: 'Q?', answer: '' };
const create = (extra: Record<string, unknown> = {}) => validateClassificationCreate({ translations: { en: translation }, ...extra });
const filters = (extra: Partial<ClassificationFilters> = {}): ClassificationFilters => ({
  topics: { values: [], includeNoTopics: false }, priorities: [], likelihoods: [], creationModes: [], cardTypes: [], ...extra,
});
const sortable = (id: string, extra: Partial<SortableClassification> = {}): SortableClassification => ({
  id, originalRank: 0, topics: ['A'], priority: 3, likelihood: 3, creationMode: 'UNKNOWN',
  metadata: validateCanonicalMetadata({ cardType: 'question' }), ...extra,
});

describe('canonical topic normalization', () => {
  it('normalizes in the approved order, deduplicates and does not mutate input', () => {
    const input = [' e\u0301 ', 'É', 'a\t\n\u00a0b', 'ß', 'SS'];
    expect(normalizeTopics(input)).toEqual(['A B', 'SS', 'É']);
    expect(input).toEqual([' e\u0301 ', 'É', 'a\t\n\u00a0b', 'ß', 'SS']);
    expect(normalizeTopics(normalizeTopics(input))).toEqual(normalizeTopics(input));
  });
  it('accepts empty and post-dedup bounds while rejecting invalid elements and unique overflow', () => {
    expect(normalizeTopics([])).toEqual([]);
    expect(normalizeTopics([...Array(11)].map(() => 'same'))).toEqual(['SAME']);
    expect(normalizeTopics([...Array(10)].map((_, index) => `t${index}`))).toHaveLength(10);
    expect(() => normalizeTopics([...Array(11)].map((_, index) => `t${index}`))).toThrow('maximum 10');
    for (const value of ['', ' \t\n ', 1, null]) expect(() => normalizeTopics([value])).toThrow();
  });
  it('enforces UTF-16 length after uppercase expansion and handles supplementary scalars', () => {
    expect(normalizeTopic('a'.repeat(200))).toHaveLength(200);
    expect(() => normalizeTopic('a'.repeat(201))).toThrow('200');
    expect(normalizeTopic('😀'.repeat(100))).toHaveLength(200);
    expect(() => normalizeTopic('ß'.repeat(101))).toThrow('200');
  });
  it('orders by Unicode scalars rather than UTF-16 code units', () => {
    const bmp = '\uE000';
    const supplementary = '\u{10000}';
    expect(bmp < supplementary).toBe(false);
    expect(compareUnicodeScalars(bmp, supplementary)).toBeLessThan(0);
    expect(normalizeTopics([supplementary, bmp])).toEqual([bmp, supplementary]);
  });
  it('applies final NFC after uppercase and is idempotent for the reviewed Greek counterexample', () => {
    const raw = '\u0390';
    const expected = '\u03AA\u0301';
    expect(normalizeTopic(raw)).toBe(expected);
    expect(normalizeTopic(expected)).toBe(expected);
    expect(normalizeTopic(normalizeTopic(raw))).toBe(normalizeTopic(raw));
  });
  it('is idempotent across every Unicode scalar value accepted as a one-scalar topic', () => {
    let checked = 0;
    let rejectedEmpty = 0;
    for (let codePoint = 0; codePoint <= 0x10ffff; codePoint++) {
      if (codePoint >= 0xd800 && codePoint <= 0xdfff) continue;
      const raw = String.fromCodePoint(codePoint);
      try {
        const once = normalizeTopic(raw);
        const twice = normalizeTopic(once);
        if (twice !== once) throw new Error(`U+${codePoint.toString(16).toUpperCase()} is not idempotent`);
        checked++;
      } catch (error) {
        if (raw.normalize('NFC').trim() !== '') throw error;
        rejectedEmpty++;
      }
    }
    expect({ checked, rejectedEmpty }).toEqual({ checked: 1_112_039, rejectedEmpty: 25 });
  });
  it('covers representative scripts, composition, expansion, whitespace and exact binary deduplication', () => {
    expect(normalizeTopics([' български ', 'é', 'e\u0301', '\u0390', '\u03AA\u0301', 'ß', 'SS', ' A\t\n\u00a0B ', '😀']))
      .toEqual(['A B', 'SS', 'É', 'Ϊ́', 'БЪЛГАРСКИ', '😀']);
    expect(normalizeTopic('α\u0313\u0301')).toBe(normalizeTopic(normalizeTopic('α\u0313\u0301')));
    expect(() => normalizeTopic(' \t\n\u00a0 ')).toThrow('empty');
  });
  it('enforces bounds against the final post-uppercase NFC value', () => {
    expect(normalizeTopic(`a${'\u0315'.repeat(199)}`)).toHaveLength(200);
    expect(() => normalizeTopic(`a${'\u0315'.repeat(200)}`)).toThrow('200');
    expect(normalizeTopic('\u0390')).toHaveLength(2);
    expect(() => normalizeTopic('ß'.repeat(101))).toThrow('200');
    expect(normalizeTopics([...Array(10)].map((_, index) => `é${index}`))).toHaveLength(10);
    expect(() => normalizeTopics([...Array(11)].map((_, index) => `é${index}`))).toThrow('maximum 10');
  });
});

describe('ratings, creation mode and pure presence-aware updates', () => {
  it('validates all ratings without coercion and applies create defaults independently', () => {
    for (const value of ratings) expect(validateRating(value)).toBe(value);
    for (const value of ['1', true, 1.5, 0, 6, NaN, Infinity]) expect(() => validateRating(value)).toThrow();
    expect(create()).toMatchObject({ topics: [], priority: 3, likelihood: 3, creationMode: 'UNKNOWN', metadata: { cardType: 'question' } });
    expect(create({ priority: null, likelihood: 5 })).toMatchObject({ priority: 3, likelihood: 5 });
  });
  it('preserves omissions, resets null ratings/UNKNOWN and clears topics', () => {
    const current = create({ topics: ['Java'], priority: 1, likelihood: 5, creationMode: 'AI' });
    expect(applyClassificationPatch(current, {})).toEqual(current);
    expect(applyClassificationPatch(current, { topics: [], priority: null, likelihood: null, creationMode: 'UNKNOWN' }))
      .toMatchObject({ topics: [], priority: 3, likelihood: 3, creationMode: 'UNKNOWN' });
    expect(() => validateCreationMode(null)).toThrow();
  });
  it('never infers ratings or creation mode from provenance or content', () => {
    const value = create({ metadata: { cardType: 'question', provenance: { type: 'sourced', sources: [{ sourceName: 'S', sourceUrl: 'https://example.com' }] } } });
    expect(value).toMatchObject({ priority: 3, likelihood: 3, creationMode: 'UNKNOWN' });
  });
  it('requires topics to be an array whenever supplied on create or patch', () => {
    expect(create()).toHaveProperty('topics', []);
    expect(create({ topics: [] })).toHaveProperty('topics', []);
    expect(create({ topics: [' java '] })).toHaveProperty('topics', ['JAVA']);
    const current = create({ topics: ['JAVA'] });
    for (const invalid of [null, 'JAVA', 1, true, {}, ['valid', null]]) {
      expect(() => create({ topics: invalid })).toThrow('topics');
      const snapshot = structuredClone(current);
      expect(() => applyClassificationPatch(current, { topics: invalid })).toThrow('topics');
      expect(current).toEqual(snapshot);
    }
    expect(applyClassificationPatch(current, {})).toHaveProperty('topics', ['JAVA']);
    expect(applyClassificationPatch(current, { topics: [] })).toHaveProperty('topics', []);
  });
  it('preserves omitted topics byte-for-byte and by order without aliasing or implicit repair', () => {
    const historical = '\u0399\u0308\u0301';
    expect(normalizeTopic(historical)).toBe('\u03AA\u0301');
    const current: CanonicalCardState = { ...create(), topics: [historical, 'Z', 'A'] };
    const patches = [
      {}, { priority: 1 }, { likelihood: 5 }, { creationMode: 'AI' },
      { metadata: { cardType: 'question' } }, { translations: { en: { question: 'Changed?', answer: '' } } },
    ];
    for (const patch of patches) {
      const updated = applyClassificationPatch(current, patch);
      expect(updated.topics).toEqual([historical, 'Z', 'A']);
      expect(updated.topics).not.toBe(current.topics);
    }
    expect(applyClassificationPatch(current, { topics: [' z ', 'é', 'e\u0301'] }).topics).toEqual(['Z', 'É']);
    const snapshot = structuredClone(current);
    expect(() => applyClassificationPatch(current, { topics: ['valid', ''] })).toThrow();
    expect(current).toEqual(snapshot);
  });
});

describe('canonical topic round trips', () => {
  it('preserves canonical identity through create, filter ingress, matching and explicit replacement', () => {
    const card = create({ topics: ['\u0390', 'e\u0301', ' no topics '] });
    const input = { topics: { values: card.topics, includeNoTopics: false }, priorities: [], likelihoods: [], creationModes: [], cardTypes: [] };
    const validated = validateClassificationFilters(input);
    expect(validated.topics.values).toEqual(card.topics);
    expect(matchesClassification(validated, card)).toBe(true);
    expect(validateClassificationFilters({ ...input, topics: { values: validated.topics.values, includeNoTopics: false } }).topics.values).toEqual(card.topics);
    expect(applyClassificationPatch(card, { topics: card.topics }).topics).toEqual(card.topics);
    expect(normalizeTopics(card.topics)).toEqual(card.topics);
    const equivalent = validateClassificationFilters({ ...input, topics: { values: ['é', '\u03AA\u0301'], includeNoTopics: false } });
    expect(matchesClassification(equivalent, card)).toBe(true);
  });
  it('keeps literal NO TOPICS distinct and stale selections restrictive after round trips', () => {
    const literal = create({ topics: ['NO TOPICS'] });
    const selected = validateClassificationFilters({ topics: { values: ['no topics'], includeNoTopics: false }, priorities: [], likelihoods: [], creationModes: [], cardTypes: [] });
    expect(matchesClassification(selected, literal)).toBe(true);
    expect(matchesClassification(selected, create())).toBe(false);
    const stale = validateClassificationFilters({ ...selected, topics: { values: ['missing'], includeNoTopics: false } });
    expect(matchesClassification(stale, literal)).toBe(false);
  });
});

describe('canonical metadata and final-state task validation', () => {
  const source = { sourceName: 'Interview', sourceUrl: 'https://example.com/i', company: 'ACME', location: 'Sofia', interviewLocation: 'Remote', publishedAt: '2024-02-29', occurrenceId: 'one' };
  it('supports type-only metadata, optional provenance, references and derived-only counts', () => {
    expect(validateCanonicalMetadata({ cardType: 'question' })).toEqual({ cardType: 'question', occurrenceCount: 0 });
    const metadata = validateCanonicalMetadata({ cardType: 'task', provenance: { type: 'mixed', sources: [source, { ...source, sourceUrl: 'https://example.com/repost' }] }, answerReferences: [{ title: 'Ref', url: 'https://example.com/ref' }] });
    expect(metadata).toMatchObject({ cardType: 'task', occurrenceCount: 1, provenance: { sources: [source, expect.any(Object)] }, answerReferences: [{ title: 'Ref' }] });
    expect(metadataForStorage(metadata)).not.toHaveProperty('occurrenceCount');
    expect(derivedMetadata({ ...metadata, occurrenceCount: 99 })).toHaveProperty('occurrenceCount', 1);
  });
  it('retains strict nested validation and existing evidence rules', () => {
    expect(() => validateCanonicalMetadata({ cardType: 'question', unknown: true })).toThrow('unsupported');
    expect(() => validateCanonicalMetadata({ cardType: 'question', provenance: { type: 'sourced', sources: [] } })).toThrow('requires');
    expect(() => validateCanonicalMetadata({ cardType: 'question', provenance: { type: 'generated', sources: [{ ...source, sourceUrl: 'javascript:x' }] } })).toThrow('HTTP');
    expect(() => validateCanonicalMetadata({ cardType: 'question', provenance: { type: 'generated', sources: [{ ...source, publishedAt: '2024-02-30' }] } })).toThrow('date');
    expect(() => validateCanonicalMetadata({ cardType: 'question', occurrenceCount: 0 })).toThrow('unsupported');
  });
  it('applies metadata clears and null reset without mutating the original', () => {
    const original = create({ metadata: { cardType: 'question', provenance: { type: 'sourced', sources: [source] }, answerReferences: [{ title: 'Ref', url: 'https://example.com' }] } });
    const snapshot = structuredClone(original);
    expect(applyClassificationPatch(original, { metadata: { provenance: null, answerReferences: [] } }).metadata)
      .toEqual({ cardType: 'question', occurrenceCount: 0, answerReferences: [] });
    expect(applyClassificationPatch(original, { metadata: null }).metadata).toEqual({ cardType: 'question', occurrenceCount: 0 });
    expect(() => applyClassificationPatch(original, { metadata: { answerReferences: [{ title: '', url: 'bad' }] } })).toThrow();
    expect(original).toEqual(snapshot);
  });
  it('validates every final task language, including retained and non-BG/EN languages', () => {
    const multilingual = validateClassificationCreate({ metadata: { cardType: 'question' }, translations: { en: translation, de: { question: 'Frage?', answer: '' }, 'pt-BR': { question: 'Pergunta?', answer: '' } } });
    expect(() => applyClassificationPatch(multilingual, { metadata: { cardType: 'task' } })).toThrow('translations.en.questionDetails');
    const task = validateClassificationCreate({ metadata: { cardType: 'task' }, translations: { en: { ...translation, questionDetails: 'Do it.' }, de: { question: 'Frage?', answer: '', questionDetails: 'Tun.' } } });
    expect(() => applyClassificationPatch(task, { translations: { de: { question: 'Frage?', answer: '', questionDetails: '   ' } } })).toThrow('translations.de.questionDetails');
    expect(applyClassificationPatch(task, { metadata: { cardType: 'question' }, translations: { de: { question: 'Frage?', answer: '', questionDetails: '' } } }).metadata.cardType).toBe('question');
    expect(completeTranslation({ ...translation, questionDetails: 'Task' }, 'task')).toBe(true);
  });
});

describe('filter contracts and predicates', () => {
  const card = create({ topics: ['Java', 'NO TOPICS'], priority: 1, likelihood: 2, creationMode: 'AI', metadata: { cardType: 'task' }, translations: { en: { ...translation, questionDetails: 'Task' } } });
  it('validates, normalizes and deduplicates the full strict structure without a 10-selection cap', () => {
    const value = validateClassificationFilters({ topics: { values: [...Array(11)].map((_, i) => ` t${i} `), includeNoTopics: false }, priorities: [1, 1], likelihoods: [], creationModes: ['AI'], cardTypes: ['task'] });
    expect(value.topics.values).toHaveLength(11);
    expect(value.priorities).toEqual([1]);
    for (const invalid of [null, {}, { ...value, extra: true }, { ...value, priorities: [0] }, { ...value, topics: { values: [], includeNoTopics: 'yes' } }]) expect(() => validateClassificationFilters(invalid)).toThrow();
  });
  it('is unrestricted when empty and applies OR within / AND across all five categories', () => {
    expect(matchesClassification(filters(), card)).toBe(true);
    expect(matchesClassification(filters({ topics: { values: ['JAVA', 'OTHER'], includeNoTopics: false }, priorities: [1, 2], likelihoods: [2], creationModes: ['AI'], cardTypes: ['task'] }), card)).toBe(true);
    expect(matchesClassification(filters({ priorities: [5] }), card)).toBe(false);
  });
  it('keeps No Topics separate from a literal topic and stale selections restrictive', () => {
    const empty = create();
    expect(matchesClassification(filters({ topics: { values: [], includeNoTopics: true } }), empty)).toBe(true);
    expect(matchesClassification(filters({ topics: { values: ['NO TOPICS'], includeNoTopics: false } }), empty)).toBe(false);
    expect(matchesClassification(filters({ topics: { values: ['MISSING'], includeNoTopics: false } }), card)).toBe(false);
    expect(matchesClassification(filters({ topics: { values: ['MISSING'], includeNoTopics: true } }), empty)).toBe(true);
  });
});

describe('single-field deterministic sorting', () => {
  const sorted = (items: SortableClassification[], field: Parameters<typeof classificationComparator>[0]['field'], direction: 'asc' | 'desc') =>
    [...items].sort(classificationComparator(validateClassificationSort({ field, direction })));
  it('rejects unsupported contracts and canonicalizes default direction', () => {
    expect(validateClassificationSort({ field: 'default', direction: 'asc' })).toEqual({ field: 'default', direction: 'asc' });
    for (const input of [{ field: 'default', direction: 'desc' }, { field: 'bad', direction: 'asc' }, [{ field: 'priority', direction: 'asc' }], { field: 'priority', direction: 'sideways' }, { field: 'priority', direction: 'asc', then: [] }]) expect(() => validateClassificationSort(input)).toThrow();
  });
  it('sorts every scalar field in both directions with fixed last sentinels', () => {
    const values = [sortable('a', { priority: 1, likelihood: 5, creationMode: 'AI', metadata: validateCanonicalMetadata({ cardType: 'question' }) }), sortable('b', { priority: 5, likelihood: 1, creationMode: 'MANUAL', metadata: validateCanonicalMetadata({ cardType: 'task' }) }), sortable('c', { priority: 3, likelihood: 3, creationMode: 'UNKNOWN' })];
    expect(sorted(values, 'priority', 'asc').map(x => x.id)).toEqual(['a', 'c', 'b']);
    expect(sorted(values, 'priority', 'desc').map(x => x.id)).toEqual(['b', 'c', 'a']);
    expect(sorted(values, 'likelihood', 'asc').map(x => x.id)).toEqual(['b', 'c', 'a']);
    expect(sorted(values, 'likelihood', 'desc').map(x => x.id)).toEqual(['a', 'c', 'b']);
    expect(sorted(values, 'creationMode', 'asc').map(x => x.id)).toEqual(['a', 'b', 'c']);
    expect(sorted(values, 'creationMode', 'desc').map(x => x.id)).toEqual(['b', 'a', 'c']);
    expect(sorted(values, 'cardType', 'asc').map(x => x.id)).toEqual(['a', 'c', 'b']);
    expect(sorted(values, 'cardType', 'desc').map(x => x.id)).toEqual(['b', 'a', 'c']);
  });
  it('sorts topic sequences/prefixes/scalars, always puts empty last and leaves sources untouched', () => {
    const source = [sortable('supp', { topics: ['\u{10000}'] }), sortable('prefix', { topics: ['A'] }), sortable('long', { topics: ['A', 'B'] }), sortable('bmp', { topics: ['\uE000'] }), sortable('empty', { topics: [] })];
    const snapshot = structuredClone(source);
    expect(sorted(source, 'topics', 'asc').map(x => x.id)).toEqual(['prefix', 'long', 'bmp', 'supp', 'empty']);
    expect(sorted(source, 'topics', 'desc').map(x => x.id)).toEqual(['supp', 'bmp', 'long', 'prefix', 'empty']);
    expect(source).toEqual(snapshot);
  });
  it('uses global originalRank then scalar card ID ties in both directions and obeys comparator laws', () => {
    const values = [sortable('z', { originalRank: 2 }), sortable('b', { originalRank: 1 }), sortable('a', { originalRank: 1 })];
    for (const direction of ['asc', 'desc'] as const) expect(sorted(values, 'priority', direction).map(x => x.id)).toEqual(['a', 'b', 'z']);
    const comparator = classificationComparator({ field: 'priority', direction: 'asc' });
    for (const a of values) for (const b of values) {
      if (a === b) expect(comparator(a, b)).toBe(0);
      else expect(Math.sign(comparator(a, b))).toBe(-Math.sign(comparator(b, a)));
    }
    const ordered = [...values].sort(comparator);
    expect(comparator(ordered[0], ordered[2])).toBeLessThanOrEqual(0);
    expect(sorted(values, 'default', 'asc').map(x => x.id)).toEqual(['a', 'b', 'z']);
  });
  it('satisfies comparator laws for every supported field and direction on varied primary values', () => {
    const values = [
      sortable('same-rank-b', { originalRank: 2, topics: ['B'], priority: 1, likelihood: 5, creationMode: 'AI', metadata: validateCanonicalMetadata({ cardType: 'question' }) }),
      sortable('same-rank-a', { originalRank: 2, topics: ['A', 'B'], priority: 1, likelihood: 2, creationMode: 'MANUAL', metadata: validateCanonicalMetadata({ cardType: 'task' }) }),
      sortable('low-rank', { originalRank: 1, topics: ['A'], priority: 3, likelihood: 2, creationMode: 'UNKNOWN', metadata: validateCanonicalMetadata({ cardType: 'question' }) }),
      sortable('high-value', { originalRank: 4, topics: ['\u{10000}'], priority: 5, likelihood: 1, creationMode: 'AI', metadata: validateCanonicalMetadata({ cardType: 'task' }) }),
      sortable('empty', { originalRank: 0, topics: [], priority: 5, likelihood: 5, creationMode: 'UNKNOWN', metadata: validateCanonicalMetadata({ cardType: 'question' }) }),
    ];
    const snapshot = structuredClone(values);
    const sorts = [
      { field: 'default', direction: 'asc' },
      ...(['topics', 'priority', 'likelihood', 'creationMode', 'cardType'] as const).flatMap(field =>
        (['asc', 'desc'] as const).map(direction => ({ field, direction }))),
    ] as const;
    for (const sort of sorts) {
      const compare = classificationComparator(sort);
      for (const a of values) {
        expect(compare(a, a), `${sort.field}/${sort.direction} reflexivity`).toBe(0);
        for (const b of values) {
          const ab = Math.sign(compare(a, b));
          const ba = Math.sign(compare(b, a));
          expect(ab === 0 ? ba === 0 : ab === -ba, `${sort.field}/${sort.direction} antisymmetry ${a.id}/${b.id}`).toBe(true);
          for (const c of values) {
            if (compare(a, b) <= 0 && compare(b, c) <= 0) {
              expect(compare(a, c), `${sort.field}/${sort.direction} transitivity ${a.id}/${b.id}/${c.id}`).toBeLessThanOrEqual(0);
            }
          }
        }
      }
      [...values].sort(compare);
    }
    expect(values).toEqual(snapshot);
  });
  it('uses ascending rank then scalar card ID for primary ties in either direction', () => {
    const values = [
      sortable('b', { originalRank: 1, priority: 3 }),
      sortable('a', { originalRank: 1, priority: 3 }),
      sortable('rank-zero', { originalRank: 0, priority: 3 }),
    ];
    for (const direction of ['asc', 'desc'] as const) {
      expect(sorted(values, 'priority', direction).map(value => value.id)).toEqual(['rank-zero', 'a', 'b']);
    }
  });
});

it('provides complete approved English and Bulgarian classification labels', () => {
  expect(classificationLabels.en.priority).toEqual({ 1: 'P1 — Critical', 2: 'P2 — High', 3: 'P3 — Medium', 4: 'P4 — Low', 5: 'P5 — Very Low' });
  expect(classificationLabels.bg.likelihood[1]).toBe('1 — Много висока');
  expect(classificationLabels.en).toMatchObject({ creationMode: 'Creation Mode', cardType: 'Card Type', question: 'Question', task: 'Task', noTopics: 'No Topics', taskSpecification: 'Task Specification', allCardTypes: 'All Card Types' });
  expect(classificationLabels.bg).toMatchObject({ creationMode: 'Начин на създаване', cardType: 'Тип карта', question: 'Въпрос', task: 'Задача', noTopics: 'Без теми', taskSpecification: 'Спецификация на задачата', allCardTypes: 'Всички типове карти' });
  expect(Object.keys(classificationLabels.en.priority)).toHaveLength(ratings.length);
});
