export const languages = ['bg', 'en'] as const;
export type Language = typeof languages[number];
export const sections = ['simple', 'example', 'details'] as const;
export type Section = typeof sections[number];
export type Translation = { question: string; answer: string } & Partial<Record<Section, string>>;
export type Translations = Partial<Record<Language, Translation>>;

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
