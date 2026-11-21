export const languages = ['bg', 'en'] as const;
export type Language = typeof languages[number];
export const sections = ['simple', 'example', 'details'] as const;
export type Section = typeof sections[number];
export type Translation = { question: string; answer: string } & Partial<Record<Section, string>>;
export type Translations = Partial<Record<Language, Translation>>;

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
  return value === 'bg' || value === 'en';
}

export function isSection(value: unknown): value is Section {
  return sections.some(section => section === value);
}

export function legacyLanguage(question: string): Language {
  return /[А-Яа-я]/u.test(question) ? 'bg' : 'en';
}

export function selectTranslation(translations: Translations, preferred: Language) {
  const other = preferred === 'bg' ? 'en' : 'bg';
  const language = translations[preferred] ? preferred : other;
  const translation = translations[language];
  return { language, translation, fallback: language !== preferred };
}

export function selectExplanation(translations: Translations, language: Language, section: Section) {
  const other = language === 'bg' ? 'en' : 'bg';
  const content = translations[language]?.[section];
  return content ? { language, content } : { language: other, content: translations[other]?.[section] };
}

export function validTranslation(value: Translation) {
  return Boolean(value.question.trim() && value.answer.trim() && value.question.length <= 2000 &&
    value.answer.length <= 20000 && sections.every(section => (value[section]?.length ?? 0) <= 20000));
}
