import type { CanonicalCardMetadata, CanonicalMetadataPatch } from './metadata';
import { applyCanonicalMetadataPatch, validateCanonicalMetadata } from './metadata';
import type { Translation, Translations } from './translations';
import { validateFinalTranslations } from './translations';

export const ratings = [1, 2, 3, 4, 5] as const;
export type Rating = typeof ratings[number];
export const creationModes = ['MANUAL', 'AI', 'UNKNOWN'] as const;
export type CreationMode = typeof creationModes[number];
export const cardTypes = ['question', 'task'] as const;
export type CardType = typeof cardTypes[number];

export const DEFAULT_RATING: Rating = 3;
export const DEFAULT_CREATION_MODE: CreationMode = 'UNKNOWN';
export const MAX_TOPICS_PER_CARD = 10;
export const MAX_TOPIC_LENGTH = 200;

function fail(field: string, reason: string): never { throw new Error(`${field}: ${reason}`); }
function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field, 'expected an object');
  return value as Record<string, unknown>;
}
function allowed(value: Record<string, unknown>, names: readonly string[], field: string) {
  const unknown = Object.keys(value).find(key => !names.includes(key));
  if (unknown) fail(`${field}.${unknown}`, 'unsupported field');
}

/** Binary ordering by Unicode scalar value, independent of locale and UTF-16 code units. */
export function compareUnicodeScalars(left: string, right: string): number {
  const a = Array.from(left, value => value.codePointAt(0)!);
  const b = Array.from(right, value => value.codePointAt(0)!);
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  }
  return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
}

export function normalizeTopic(value: unknown, field = 'topic'): string {
  if (typeof value !== 'string') fail(field, 'expected a string');
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ').toUpperCase();
  if (!normalized) fail(field, 'must not be empty');
  if (normalized.length > MAX_TOPIC_LENGTH) fail(field, `exceeds ${MAX_TOPIC_LENGTH} UTF-16 code units`);
  return normalized;
}

export function normalizeTopics(input: unknown, options: { maximum?: number; field?: string } = {}): string[] {
  const field = options.field ?? 'topics';
  if (!Array.isArray(input)) fail(field, 'expected a list');
  const unique = new Set(input.map((value, index) => normalizeTopic(value, `${field}[${index}]`)));
  const maximum = options.maximum ?? MAX_TOPICS_PER_CARD;
  if (unique.size > maximum) fail(field, `maximum ${maximum} unique topics`);
  return [...unique].sort(compareUnicodeScalars);
}

export function validateRating(value: unknown, field = 'rating'): Rating {
  if (!Number.isInteger(value) || !ratings.includes(value as Rating)) fail(field, 'expected an integer from 1 to 5');
  return value as Rating;
}
export function validateCreationMode(value: unknown, field = 'creationMode'): CreationMode {
  if (!creationModes.includes(value as CreationMode)) fail(field, 'expected MANUAL, AI or UNKNOWN');
  return value as CreationMode;
}
export function validateCardType(value: unknown, field = 'cardType'): CardType {
  if (!cardTypes.includes(value as CardType)) fail(field, 'expected question or task');
  return value as CardType;
}

export interface CanonicalClassification {
  topics: string[];
  priority: Rating;
  likelihood: Rating;
  creationMode: CreationMode;
  metadata: CanonicalCardMetadata;
}
export interface CanonicalCardState extends CanonicalClassification { translations: Translations; }
export interface CanonicalClassificationInput {
  topics?: unknown;
  priority?: unknown;
  likelihood?: unknown;
  creationMode?: unknown;
  metadata?: unknown;
  translations?: unknown;
}
export interface CanonicalClassificationPatch {
  topics?: unknown;
  priority?: unknown;
  likelihood?: unknown;
  creationMode?: unknown;
  metadata?: CanonicalMetadataPatch | null | unknown;
  translations?: unknown;
}

function ratingForCreate(value: unknown, field: string) { return value === undefined || value === null ? DEFAULT_RATING : validateRating(value, field); }
function ratingForPatch(value: unknown, current: Rating, field: string) { return value === undefined ? current : value === null ? DEFAULT_RATING : validateRating(value, field); }

function validateTranslationsInput(value: unknown, field = 'translations'): Translations {
  const data = object(value, field);
  return Object.fromEntries(Object.entries(data).map(([language, translation]) => {
    const item = object(translation, `${field}.${language}`);
    allowed(item, ['question', 'answer', 'questionDetails'], `${field}.${language}`);
    return [language, { question: item.question, answer: item.answer, ...(item.questionDetails === undefined ? {} : { questionDetails: item.questionDetails }) } as Translation];
  }));
}

function mergeTranslations(existing: Translations, patch: unknown): Translations {
  if (patch === undefined) return structuredClone(existing);
  const supplied = validateTranslationsInput(patch);
  return { ...structuredClone(existing), ...supplied };
}

export function validateClassificationCreate(input: unknown): CanonicalCardState {
  const data = object(input, 'card');
  allowed(data, ['topics', 'priority', 'likelihood', 'creationMode', 'metadata', 'translations'], 'card');
  const metadata = data.metadata === undefined || data.metadata === null
    ? validateCanonicalMetadata({ cardType: 'question' })
    : validateCanonicalMetadata(data.metadata);
  const translations = validateTranslationsInput(data.translations ?? {});
  validateFinalTranslations(translations, metadata.cardType);
  return {
    topics: normalizeTopics(data.topics ?? []),
    priority: ratingForCreate(data.priority, 'priority'),
    likelihood: ratingForCreate(data.likelihood, 'likelihood'),
    creationMode: data.creationMode === undefined ? DEFAULT_CREATION_MODE : validateCreationMode(data.creationMode),
    metadata,
    translations,
  };
}

/** Applies and validates an atomic pure patch without mutating either argument. */
export function applyClassificationPatch(existing: CanonicalCardState, input: unknown): CanonicalCardState {
  const data = object(input, 'patch');
  allowed(data, ['topics', 'priority', 'likelihood', 'creationMode', 'metadata', 'translations'], 'patch');
  const metadata = data.metadata === undefined ? validateCanonicalMetadata(metadataForValidation(existing.metadata))
    : data.metadata === null ? validateCanonicalMetadata({ cardType: 'question' })
      : applyCanonicalMetadataPatch(existing.metadata, data.metadata);
  const translations = mergeTranslations(existing.translations, data.translations);
  validateFinalTranslations(translations, metadata.cardType);
  return {
    topics: normalizeTopics(data.topics === undefined ? existing.topics : data.topics),
    priority: ratingForPatch(data.priority, validateRating(existing.priority, 'priority'), 'priority'),
    likelihood: ratingForPatch(data.likelihood, validateRating(existing.likelihood, 'likelihood'), 'likelihood'),
    creationMode: validateCreationMode(data.creationMode === undefined ? existing.creationMode : data.creationMode),
    metadata,
    translations,
  };
}

function metadataForValidation(metadata: CanonicalCardMetadata) {
  const { occurrenceCount: _derived, ...authored } = structuredClone(metadata);
  return authored;
}

export interface ClassificationFilters {
  topics: { values: string[]; includeNoTopics: boolean };
  priorities: Rating[];
  likelihoods: Rating[];
  creationModes: CreationMode[];
  cardTypes: CardType[];
}

export function validateClassificationFilters(input: unknown): ClassificationFilters {
  const data = object(input, 'filters');
  allowed(data, ['topics', 'priorities', 'likelihoods', 'creationModes', 'cardTypes'], 'filters');
  for (const key of ['topics', 'priorities', 'likelihoods', 'creationModes', 'cardTypes']) if (!(key in data)) fail(`filters.${key}`, 'required');
  const topics = object(data.topics, 'filters.topics');
  allowed(topics, ['values', 'includeNoTopics'], 'filters.topics');
  if (typeof topics.includeNoTopics !== 'boolean') fail('filters.topics.includeNoTopics', 'expected a boolean');
  const list = (value: unknown, field: string, validate: (item: unknown, field: string) => string | number) => {
    if (!Array.isArray(value)) fail(field, 'expected a list');
    return [...new Set(value.map((item, index) => validate(item, `${field}[${index}]`)))];
  };
  return {
    topics: { values: normalizeTopics(topics.values, { maximum: Number.POSITIVE_INFINITY, field: 'filters.topics.values' }), includeNoTopics: topics.includeNoTopics },
    priorities: list(data.priorities, 'filters.priorities', validateRating) as Rating[],
    likelihoods: list(data.likelihoods, 'filters.likelihoods', validateRating) as Rating[],
    creationModes: list(data.creationModes, 'filters.creationModes', validateCreationMode) as CreationMode[],
    cardTypes: list(data.cardTypes, 'filters.cardTypes', validateCardType) as CardType[],
  };
}

export function matchesClassification(filters: ClassificationFilters, card: CanonicalClassification): boolean {
  const topicRestricted = filters.topics.values.length > 0 || filters.topics.includeNoTopics;
  const topicMatch = !topicRestricted || filters.topics.values.some(value => card.topics.includes(value)) || (filters.topics.includeNoTopics && card.topics.length === 0);
  return topicMatch &&
    (!filters.priorities.length || filters.priorities.includes(card.priority)) &&
    (!filters.likelihoods.length || filters.likelihoods.includes(card.likelihood)) &&
    (!filters.creationModes.length || filters.creationModes.includes(card.creationMode)) &&
    (!filters.cardTypes.length || filters.cardTypes.includes(card.metadata.cardType));
}

export const sortFields = ['default', 'topics', 'priority', 'likelihood', 'creationMode', 'cardType'] as const;
export type ClassificationSortField = typeof sortFields[number];
export interface ClassificationSort { field: ClassificationSortField; direction: 'asc' | 'desc'; }
export interface SortableClassification extends CanonicalClassification { id: string; originalRank: number; }

export function validateClassificationSort(input: unknown): ClassificationSort {
  const data = object(input, 'sorting');
  allowed(data, ['field', 'direction'], 'sorting');
  if (!sortFields.includes(data.field as ClassificationSortField)) fail('sorting.field', 'unsupported field');
  if (data.direction !== 'asc' && data.direction !== 'desc') fail('sorting.direction', 'expected asc or desc');
  if (data.field === 'default' && data.direction !== 'asc') fail('sorting.direction', 'default order has canonical direction asc');
  return data as unknown as ClassificationSort;
}

function sequence(left: string[], right: string[]) {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const result = compareUnicodeScalars(left[index], right[index]);
    if (result) return result;
  }
  return left.length === right.length ? 0 : left.length < right.length ? -1 : 1;
}
export function classificationComparator(sort: ClassificationSort): (left: SortableClassification, right: SortableClassification) => number {
  return (left, right) => {
    let primary = 0;
    if (sort.field === 'topics') {
      primary = left.topics.length === 0 || right.topics.length === 0
        ? (left.topics.length === right.topics.length ? 0 : left.topics.length === 0 ? 1 : -1)
        : sequence(left.topics, right.topics) * (sort.direction === 'desc' ? -1 : 1);
    } else if (sort.field === 'priority' || sort.field === 'likelihood') {
      primary = (left[sort.field] - right[sort.field]) * (sort.direction === 'desc' ? -1 : 1);
    } else if (sort.field === 'creationMode') {
      const order = sort.direction === 'asc' ? ['AI', 'MANUAL', 'UNKNOWN'] : ['MANUAL', 'AI', 'UNKNOWN'];
      primary = order.indexOf(left.creationMode) - order.indexOf(right.creationMode);
    } else if (sort.field === 'cardType') {
      const value = left.metadata.cardType === right.metadata.cardType ? 0 : left.metadata.cardType === 'question' ? -1 : 1;
      primary = value * (sort.direction === 'desc' ? -1 : 1);
    }
    if (primary) return primary;
    const rank = left.originalRank - right.originalRank;
    return rank || compareUnicodeScalars(left.id, right.id);
  };
}

export const classificationLabels = {
  en: {
    priority: { 1: 'P1 — Critical', 2: 'P2 — High', 3: 'P3 — Medium', 4: 'P4 — Low', 5: 'P5 — Very Low' },
    likelihood: { 1: '1 — Very High', 2: '2 — High', 3: '3 — Medium', 4: '4 — Low', 5: '5 — Very Low' },
    creationMode: 'Creation Mode', cardType: 'Card Type', question: 'Question', task: 'Task', noTopics: 'No Topics', taskSpecification: 'Task Specification', allCardTypes: 'All Card Types',
  },
  bg: {
    priority: { 1: 'P1 — Критичен', 2: 'P2 — Висок', 3: 'P3 — Среден', 4: 'P4 — Нисък', 5: 'P5 — Много нисък' },
    likelihood: { 1: '1 — Много висока', 2: '2 — Висока', 3: '3 — Средна', 4: '4 — Ниска', 5: '5 — Много ниска' },
    creationMode: 'Начин на създаване', cardType: 'Тип карта', question: 'Въпрос', task: 'Задача', noTopics: 'Без теми', taskSpecification: 'Спецификация на задачата', allCardTypes: 'Всички типове карти',
  },
} as const satisfies Record<'en' | 'bg', { priority: Record<Rating, string>; likelihood: Record<Rating, string>; creationMode: string; cardType: string; question: string; task: string; noTopics: string; taskSpecification: string; allCardTypes: string }>;
