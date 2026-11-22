export const languages = ['bg', 'en'] as const;
export type Language = string;
export const sections = ['simple', 'example', 'details'] as const;
export type Section = typeof sections[number];
export type Translation = { question: string; answer: string; questionDetails?: string } & Partial<Record<Section, string>>;
export type Translations = Record<Language, Translation>;

export const studyControlLabels = {
  en: {
    controls: 'Study controls', actions: 'Study actions', previous: 'Previous',
    show: 'Show answer', hide: 'Hide answer', learn: 'Learned', repeat: 'Repeat', next: 'Next',
  },
  bg: {
    controls: 'Управление на обучението', actions: 'Действия за учене', previous: 'Предишна',
    show: 'Покажи отговора', hide: 'Скрий отговора', learn: 'Научена', repeat: 'Повтори', next: 'Следваща',
  },
} satisfies Record<Language, Record<string, string>>;

export const answerSizeLabels = {
  en: {
    group: 'Answer text size',
    decrease: 'Decrease answer text size',
    increase: 'Increase answer text size',
    reset: 'Reset answer text size to 100%',
  },
  bg: {
    group: 'Размер на текста на отговора',
    decrease: 'Намали текста на отговора',
    increase: 'Увеличи текста на отговора',
    reset: 'Върни размера на текста на отговора на 100%',
  },
};

export function isLanguage(value: unknown): value is Language {
  if (typeof value !== 'string' || !value) return false;
  try { return Intl.getCanonicalLocales(value)[0] === value; } catch { return false; }
}

export function isSection(value: unknown): value is Section {
  return sections.some(section => section === value);
}

export function legacyLanguage(question: string): Language {
  return /[А-Яа-я]/u.test(question) ? 'bg' : 'en';
}

export function completeTranslation(value: Translation | undefined, cardType?: string): value is Translation {
  return Boolean(value && validTranslation(value) && (cardType !== 'coding_task' || value.questionDetails?.trim()));
}

export function selectTranslation(translations: Translations, preferred: Language, primary: Language = 'en', cardType?: string) {
  const language = completeTranslation(translations[preferred], cardType) ? preferred : primary;
  const translation = completeTranslation(translations[language], cardType) ? translations[language] : undefined;
  return { language, translation, fallback: language !== preferred };
}

export function selectExplanation(translations: Translations, language: Language, section: Section, primary: string = language === 'en' ? 'bg' : 'en') {
  const content = translations[language]?.[section];
  return content ? { language, content } : { language: primary, content: translations[primary]?.[section] };
}

export function primaryLanguageFirst(languages: string[], primary?: string | null) {
  const sorted = [...languages].sort((a, b) => a.localeCompare(b));
  return primary && sorted.includes(primary) ? [primary, ...sorted.filter(language => language !== primary)] : sorted;
}

export function languageUnion(decks: { supportedLanguages: string[] }[]) {
  return [...new Set(decks.flatMap(deck => deck.supportedLanguages))].sort();
}

export function reconcileLanguage(preferred: string, available: string[]) {
  return available.includes(preferred) ? preferred : available[0] ?? 'en';
}

export function validTranslation(value: Translation) {
  return Boolean(value && typeof value.question === 'string' && typeof value.answer === 'string' && value.question.trim() && value.question.length <= 2000 &&
    value.answer.length <= 20000 && (value.questionDetails === undefined || (typeof value.questionDetails === 'string' && value.questionDetails.length <= 20000)) && sections.every(section => value[section] === undefined || (typeof value[section] === 'string' && value[section].length <= 20000)));
}
