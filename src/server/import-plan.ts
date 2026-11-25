import { metadataForStorage } from '../lib/metadata';
import type { CardMetadata } from '../lib/metadata';
import { questionKey } from '../lib/markdown';
import type { parseMarkdown } from '../lib/markdown';
import { validTranslation } from '../lib/translations';
import type { Language, Translation, Translations } from '../lib/translations';
import { normalizeTopic } from '../lib/classification';
import { applyClassificationPatch } from '../lib/classification';
import { validateCanonicalMetadata } from '../lib/metadata';
import type { CanonicalCardMetadata } from '../lib/metadata';
import type { CreationMode, Rating } from '../lib/classification';

export interface CanonicalStoredState {
  metadata: CanonicalCardMetadata;
  topics: string[];
  priority: Rating;
  likelihood: Rating;
  creation_mode: CreationMode;
}

export interface ImportTarget {
  id: string;
  metadata?: CardMetadata | null;
  topicsProvided?: boolean;
  import_key: string | null;
  primary_language: Language;
  translations: Translations;
  interview_priority: number | null;
  difficulty: number | null;
  /** Non-enumerable on read DTOs; preserves canonical state through legacy write adapters. */
  canonical?: CanonicalStoredState;
  /** Internal import signal: omitted legacy metadata must not replace canonical memberships. */
  legacyMetadataProvided?: boolean;
}
interface PreviewRow {
  classificationChange?: { before: CanonicalStoredState | null; after: CanonicalStoredState; beforeDifficulty: number | null; difficulty: number | null };
  index: string;
  kind: 'new' | 'translation' | 'duplicate' | 'conflict' | 'invalid' | 'link' | 'metadata';
  question: string;
  answer?: string;
  answerOperation?: 'create' | 'preserve' | 'clear' | 'replace';
  language?: Language;
  existingAnswer?: string;
  incoming?: Translation;
  existingTranslation?: Translation;
  key?: string;
  message?: string;
  candidates?: { id: string; question: string }[];
  allowNew?: boolean;
  metadata?: CardMetadata | null;
}

const comparable = (value: Translation) => JSON.stringify([
  questionKey(value.question), value.answer ?? '', value.questionDetails ?? '',
]);

export function planImport(
  parsed: ReturnType<typeof parseMarkdown>, existing: ImportTarget[],
  links: Record<string, unknown>, choices: Record<string, unknown>,
) {
  const rows: PreviewRow[] = [];
  const changed = new Map<string, ImportTarget>();
  const cards = new Map(existing.map(card => [card.id, card]));
  const claimed = new Set<string>();

  for (const [index, draft] of parsed.cards.entries()) {
    const incoming = draft.translations;
    const primary = (parsed.metadata.primaryLanguage && incoming[parsed.metadata.primaryLanguage] ? parsed.metadata.primaryLanguage : Object.keys(incoming)[0]);
    const question = (primary && incoming[primary]?.question) || '';
    const key = draft.key;
    const prefix = String(index);
    const candidates = [...cards.values()].filter(card => Object.values(card.translations).some(translation =>
      Object.values(incoming).some(value => questionKey(value.question) === questionKey(translation.question))));
    let target = key ? [...cards.values()].find(card => card.import_key === key) : candidates[0];
    if (!primary || draft.error || Object.values(incoming).some(value => !validTranslation({ ...value, answer: value.answer ?? '' }))) {
      rows.push({ index: prefix, question, key: key ?? undefined, kind: 'invalid', message: draft.error });
      continue;
    }

    if (!target) {
      const unkeyed = candidates.filter(card => !card.import_key);
      const available = existing.filter(card => !card.import_key && !claimed.has(card.id));
      const matching = unkeyed.filter(card => !claimed.has(card.id));
      if (matching.length === 1 && candidates.length === 1) target = matching[0];
      else if (available.length || candidates.length) {
        const pick = links[prefix];
        const options = matching.length ? matching : available;
        target = options.find(card => card.id === pick);
        if (!target && !(pick === 'new' && !candidates.length)) {
          rows.push({
            index: prefix, question, key: key ?? undefined, kind: 'link',
            candidates: options.map(card => ({ id: card.id, question: card.translations[card.primary_language]?.question ?? '' })),
            allowNew: !candidates.length,
            message: candidates.length && !options.length ? 'The question already belongs to a keyed card. Use its existing card key.' : undefined,
          });
          continue;
        }
      }
    }
    if (target && claimed.has(target.id)) {
      rows.push({ index: prefix, question, kind: 'invalid', message: 'Two entries target the same card.' });
      continue;
    }

    const isNew = !target;
    const id = target?.id ?? crypto.randomUUID();
    const next: ImportTarget = {
      metadata: canonicalLegacyMetadata(draft.metadata) ?? target?.metadata ?? null,
      id, import_key: key ?? target?.import_key ?? null,
      primary_language: target?.primary_language ?? primary, translations: { ...target?.translations },
      interview_priority: draft.interviewPriority ?? target?.interview_priority ?? null,
      difficulty: draft.difficulty ?? target?.difficulty ?? null,
      canonical: target?.canonical,
      legacyMetadataProvided: draft.metadata !== undefined,
    };
    claimed.add(id);
    let dirty = isNew || next.import_key !== target?.import_key;
    if (target && (next.interview_priority !== target.interview_priority || next.difficulty !== target.difficulty || stableMetadata(next.metadata) !== stableMetadata(target.metadata))) {
      rows.push({ index: prefix + ':metadata', kind: 'metadata', question, key: key ?? undefined, metadata: next.metadata });
      dirty = true;
    }
    let first = true;
    for (const language of Object.keys(incoming)) {
      const value = incoming[language];
      if (!value) continue;
      const actual = language;
      const previous = next.translations[actual];
      const proposed: Translation = { ...previous, ...value, answer: value.answer ?? previous?.answer ?? '' };
      const rowIndex = prefix + ':' + actual;
      const duplicate = previous && comparable(previous) === comparable(proposed);
      const kind = duplicate ? 'duplicate' : previous ? 'conflict' : isNew && first ? 'new' : 'translation';
      rows.push({
        index: rowIndex, kind, question: value.question, answer: proposed.answer, language: actual,
        answerOperation: !previous ? 'create' : choices[rowIndex] === 'keep' || value.answer === undefined ? 'preserve' : value.answer === '' ? 'clear' : 'replace',
        metadata: next.metadata, existingAnswer: previous?.answer, incoming: proposed, existingTranslation: previous, key: key ?? undefined,
      });
      first = false;
      if (kind === 'duplicate' || (kind === 'conflict' && (parsed.version === 5 ? choices[rowIndex] === 'keep' : choices[rowIndex] !== 'update'))) continue;
      next.translations[actual] = proposed;
      dirty = true;
    }
    if (parsed.version === 5) {
      try {
        const supplied = draft.canonical ?? {};
        const { difficulty, ...patch } = supplied;
        const base = target?.canonical ?? { topics: [], priority: 3 as const, likelihood: 3 as const, creation_mode: 'UNKNOWN' as const, metadata: validateCanonicalMetadata({ cardType: 'question' }) };
        const final = applyClassificationPatch({ ...base, creationMode: base.creation_mode, translations: next.translations }, {
          ...patch, ...(patch.creationMode === null ? { creationMode: 'UNKNOWN' } : {}),
        });
        next.canonical = { topics: final.topics, priority: final.priority, likelihood: final.likelihood, creation_mode: final.creationMode, metadata: final.metadata };
        next.topicsProvided = !target || supplied.topics !== undefined;
        next.difficulty = difficulty === undefined ? target?.difficulty ?? null : difficulty;
        const comparableState = (value: CanonicalStoredState | undefined) => value && JSON.stringify([value.topics, value.priority, value.likelihood, value.creation_mode, stableMetadata(value.metadata)]);
        if (comparableState(next.canonical) !== comparableState(target?.canonical) || next.difficulty !== target?.difficulty) {
          rows.push({ index: prefix + ':classification', kind: 'metadata', question, key, classificationChange: { before: target?.canonical ?? null, after: next.canonical, beforeDifficulty: target?.difficulty ?? null, difficulty: next.difficulty } });
          dirty = true;
        }
      } catch (error) {
        rows.push({ index: prefix + ':validation', kind: 'invalid', question, key, message: error instanceof Error ? error.message : 'Invalid final card' });
        continue;
      }
    }
    if (dirty) {
      cards.set(id, next);
      changed.set(id, next);
    }
  }

  return { rows, changed: [...changed.values()], cards: [...cards.values()] };
}

export function uniqueQuestions(cards: ImportTarget[]) {
  const seen = new Map<string, string>();
  for (const card of cards) {
    for (const language of Object.keys(card.translations)) {
      const translation = card.translations[language];
      if (!translation) continue;
      const key = language + ':' + questionKey(translation.question);
      if (seen.has(key) && seen.get(key) !== card.id) return false;
      seen.set(key, card.id);
    }
  }
  return true;
}

function stableMetadata(value: CardMetadata | CanonicalCardMetadata | null | undefined): string {
 const sort = (v: unknown): unknown => Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,item])=>[k,sort(item)])) : v;
 return JSON.stringify(sort(metadataForStorage(value)));
}

/** Normalize the legacy scalar at the import-plan/storage boundary without changing v4 grammar. */
function canonicalLegacyMetadata(value: CardMetadata | null | undefined): CardMetadata | null | undefined {
 return value && { ...value, topic: normalizeTopic(value.topic) };
}
