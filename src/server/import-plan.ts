import type { CardMetadata } from '../lib/metadata';
import { questionKey } from '../lib/markdown';
import type { parseMarkdown } from '../lib/markdown';
import { languages, legacyLanguage, sections, validTranslation } from '../lib/translations';
import type { Language, Translation, Translations } from '../lib/translations';

export interface ImportTarget {
  id: string;
  metadata?: CardMetadata | null;
  import_key: string | null;
  primary_language: Language;
  translations: Translations;
  interview_priority: number | null;
  difficulty: number | null;
}
interface PreviewRow {
  index: string;
  kind: 'new' | 'translation' | 'duplicate' | 'conflict' | 'invalid' | 'link' | 'metadata';
  question: string;
  answer?: string;
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
  questionKey(value.question), value.answer, value.questionDetails ?? '', ...sections.map(section => value[section] ?? ''),
]);

export function planImport(
  parsed: ReturnType<typeof parseMarkdown>, existing: ImportTarget[],
  links: Record<string, unknown>, choices: Record<string, unknown>,
) {
  const rows: PreviewRow[] = [];
  const changed = new Map<string, ImportTarget>();
  const cards = new Map(existing.map(card => [card.id, card]));
  const claimed = new Set<string>();
  const seenLegacy = new Set<string>();
  const legacyBaselines = new Map<string, Translations>();

  for (const [index, draft] of parsed.cards.entries()) {
    const bilingual = 'translations' in draft;
    const incoming: Translations = bilingual ? draft.translations : { [legacyLanguage(draft.question)]: draft };
    const primary = languages.find(language => incoming[language]);
    const question = (primary && incoming[primary]?.question) || '';
    const key = bilingual ? draft.key : null;
    const prefix = String(index);
    const candidates = [...cards.values()].filter(card => Object.values(card.translations).some(translation =>
      Object.values(incoming).some(value => questionKey(value.question) === questionKey(translation.question))));
    let target = key ? [...cards.values()].find(card => card.import_key === key) : candidates[0];
    if (!primary || (bilingual && draft.error) || Object.values(incoming).some(value => !validTranslation(value))) {
      rows.push({ index: prefix, question, key: key ?? undefined, kind: 'invalid', message: bilingual ? draft.error : undefined });
      continue;
    }

    if (bilingual && !target) {
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
    } else if (!bilingual && candidates.length > 1) {
      rows.push({ index: prefix, question, kind: 'invalid', message: 'The legacy question matches multiple cards. Use Markdown v2 with a card key.' });
      continue;
    }
    if (bilingual && target && claimed.has(target.id)) {
      rows.push({ index: prefix, question, kind: 'invalid', message: 'Two entries target the same card.' });
      continue;
    }

    const isNew = !target;
    const id = target?.id ?? crypto.randomUUID();
    const next: ImportTarget = {
      metadata: bilingual ? draft.metadata ?? target?.metadata ?? null : target?.metadata ?? null,
      id, import_key: key ?? target?.import_key ?? null,
      primary_language: target?.primary_language ?? primary, translations: { ...target?.translations },
      interview_priority: (bilingual ? draft.interviewPriority : undefined) ?? target?.interview_priority ?? null,
      difficulty: (bilingual ? draft.difficulty : undefined) ?? target?.difficulty ?? null,
    };
    if (bilingual) claimed.add(id);
    let dirty = isNew || next.import_key !== target?.import_key;
    if (target && (next.interview_priority !== target.interview_priority || next.difficulty !== target.difficulty || JSON.stringify(next.metadata ?? null) !== JSON.stringify(target.metadata ?? null))) {
      rows.push({ index: prefix + ':metadata', kind: 'metadata', question, key: key ?? undefined, metadata: next.metadata });
      dirty = true;
    }
    let first = true;
    for (const language of languages) {
      const value = incoming[language];
      if (!value) continue;
      const actual = !bilingual && target
        ? languages.find(lang => questionKey(target.translations[lang]?.question ?? '') === questionKey(value.question)) ?? language
        : language;
      const previous = bilingual ? next.translations[actual]
        : (legacyBaselines.get(id) ?? target?.translations)?.[actual];
      const proposed = { ...previous, ...value, question: !bilingual && previous ? previous.question : value.question };
      const rowIndex = bilingual ? prefix + ':' + actual : prefix;
      const signature = JSON.stringify([questionKey(value.question), value.answer]);
      const duplicate = (!bilingual && seenLegacy.has(signature)) || (previous && comparable(previous) === comparable(proposed));
      const kind = duplicate ? 'duplicate' : previous ? 'conflict' : isNew && first ? 'new' : 'translation';
      rows.push({
        index: rowIndex, kind, question: value.question, answer: value.answer, language: actual,
        metadata: next.metadata, existingAnswer: previous?.answer, incoming: value, existingTranslation: previous, key: key ?? undefined,
      });
      if (!bilingual) seenLegacy.add(signature);
      first = false;
      if (kind === 'duplicate' || (kind === 'conflict' && choices[rowIndex] !== 'update')) continue;
      next.translations[actual] = proposed;
      dirty = true;
    }
    if (dirty) {
      cards.set(id, next);
      changed.set(id, next);
    }
    if (!bilingual && !legacyBaselines.has(id)) legacyBaselines.set(id, target?.translations ?? next.translations);
  }

  return { rows, changed: [...changed.values()], cards: [...cards.values()] };
}

export function uniqueQuestions(cards: ImportTarget[]) {
  const seen = new Map<string, string>();
  for (const card of cards) {
    for (const language of languages) {
      const translation = card.translations[language];
      if (!translation) continue;
      const key = language + ':' + questionKey(translation.question);
      if (seen.has(key) && seen.get(key) !== card.id) return false;
      seen.set(key, card.id);
    }
  }
  return true;
}
