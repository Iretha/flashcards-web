import { isLanguage, validTranslation } from './translations';
import type { CardMetadata } from './metadata';
import type { Language, Translation } from './translations';

export interface ImportDraft {
  key: string;
  metadata?: CardMetadata;
  translations: Record<string, Omit<Translation, 'answer'> & { answer?: string }>;
  interviewPriority?: number;
  difficulty?: number;
  error?: string;
}

function endsCard(lines: string[], index: number) {
  let next = index + 1;
  while (next < lines.length && !lines[next].trim()) next++;
  return next === lines.length || /^ {0,3}##\s+card:/.test(lines[next]);
}

export function parseLanguages(lines: string[]): ImportDraft[] {
  const cards: ImportDraft[] = [];
  let card: ImportDraft | undefined;
  let language: Language | undefined;
  let field: keyof Translation | undefined;
  let text: string[] = [];
  let fence: string | undefined;
  const seenKeys = new Set<string>();
  const fields = new Set<string>();

  function saveField() {
    if (card && language && field) {
      const translation = card.translations[language];
      if (translation) {
        const content = text.join('\n');
        translation[field] = content.trim() ? content.replace(/^(?:[ \t]*\n)+|(?:\n[ \t]*)+$/g, '') : '';
      }
    }
    field = undefined;
    text = [];
  }

  function saveCard() {
    saveField();
    if (card) {
      if (!Object.keys(card.translations).length ||
        Object.values(card.translations).some(value => !validTranslation({ ...value, answer: value.answer ?? '' }))) {
        card.error ??= 'Each language needs a question and fields within the field limits.';
      }
      cards.push(card);
    }
    card = undefined;
    language = undefined;
    fields.clear();
  }

  for (const [index, line] of lines.entries()) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      text.push(line);
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    const header = /^ {0,3}(#{2,4})(?:[ \t]+(.*?)\s*|\s*)$/.exec(line);
    const label = header?.[2] ?? '';
    if (header?.[1] === '##' && (/^card:/.test(label) || !field)) {
      saveCard();
      const key = /^card:\s*([a-zA-Z0-9][a-zA-Z0-9_-]{0,99})$/.exec(label)?.[1] ?? '';
      card = { key, translations: {} };
      if (!key || seenKeys.has(key)) card.error = 'Use a unique card key of up to 100 letters, digits, hyphens or underscores.';
      seenKeys.add(key);
    } else if (/^ {0,3}---\s*$/.test(line) && endsCard(lines, index)) {
      saveCard();
    } else if (card && !language && header?.[1] === '###' && /^(interviewPriority|difficulty)\s*:/.test(label)) {
      const rating = /^(interviewPriority|difficulty)\s*:\s*([1-5])$/.exec(label);
      const name = label.startsWith('difficulty') ? 'difficulty' : 'interviewPriority';
      if (!rating || card[name] !== undefined) card.error ??= 'Specify each card rating at most once, using an integer from 1 to 5.';
      else card[name] = Number(rating[2]);
    } else if (card && header?.[1] === '###' && isLanguage(label)) {
      saveField();
      language = label;
      if (card.translations[language]) card.error = 'A language heading appears more than once.';
      card.translations[language] ??= { question: '' };
    } else if (card && language && header?.[1] === '####' && (label === 'question' || label === 'answer' || label === 'questionDetails')) {
      saveField();
      field = label;
      const key = language + ':' + field;
      if (fields.has(key)) card.error = 'A field appears more than once in a language.';
      fields.add(key);
    } else if (field) {
      if (marker) fence = marker[1];
      text.push(line);
    } else if (card && line.trim()) {
      card.error ??= 'Use a language heading and a supported field heading before writing content.';
    }
  }
  if (fence && card) card.error = 'Close the fenced code block.';
  saveCard();
  return cards;
}
