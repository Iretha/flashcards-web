import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { completeTranslation, isLanguage, languageUnion, reconcileLanguage, selectTranslation } from '../src/lib/translations';
import { deckLanguages, validateCardLanguages, validateLanguageChange } from '../src/server/deck-languages';
import CardLanguages from '../src/ui/CardLanguages';
import { parseMarkdown } from '../src/lib/markdown';
import { planImport } from '../src/server/import-plan';

const en = { question: 'Question?', answer: 'Answer.' };
const bg = { question: 'Vapros?', answer: 'Otgovor.' };
const de = { question: 'Frage?', answer: 'Antwort.' };
const decks = [
  { primaryLanguage: 'en', supportedLanguages: ['en', 'bg'] },
  { primaryLanguage: 'bg', supportedLanguages: ['bg', 'de'] },
  { primaryLanguage: 'fr', supportedLanguages: ['fr'] },
];

describe('universal language selection', () => {
  it('unions only selected decks without duplicates and reconciles removed choices deterministically', () => {
    expect(languageUnion(decks.slice(0, 2))).toEqual(['bg', 'de', 'en']);
    expect(languageUnion(decks.slice(1))).toEqual(['bg', 'de', 'fr']);
    expect(reconcileLanguage('de', languageUnion(decks.slice(0, 2)))).toBe('de');
    expect(reconcileLanguage('de', languageUnion([decks[0]]))).toBe('bg');
  });
  it('keeps the global preference while navigating mixed deck originals and translations', () => {
    const preference = 'de';
    expect(selectTranslation({ en }, preference, 'en')).toMatchObject({ language: 'en', fallback: true, translation: en });
    expect(selectTranslation({ bg }, preference, 'bg')).toMatchObject({ language: 'bg', fallback: true, translation: bg });
    expect(selectTranslation({ bg, de }, preference, 'bg')).toMatchObject({ language: 'de', fallback: false, translation: de });
    expect(selectTranslation({ en, bg }, preference, 'en').language).toBe('en');
    expect(preference).toBe('de');
  });
  it('rejects empty and partial translations and requires coding task statements', () => {
    for (const value of [{ question: '', answer: '' }, { question: 'Q', answer: ' ' }]) {
      expect(completeTranslation(value)).toBe(false);
      expect(selectTranslation({ en, de: value }, 'de', 'en').translation).toEqual(en);
    }
    expect(completeTranslation(en, 'coding_task')).toBe(false);
    expect(completeTranslation({ ...en, questionDetails: 'Implement it.' }, 'coding_task')).toBe(true);
    expect(selectTranslation({ de }, 'fr', 'en').translation).toBeUndefined();
  });
  it('renders only configured card buttons with accessible disabled and displayed states', () => {
    const html = renderToStaticMarkup(createElement(CardLanguages, {
      languages: ['en', 'de'], translations: { en, bg }, displayed: 'en', busy: false, onSelect: () => {},
    }));
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('disabled="" aria-pressed="false" title="DE translation unavailable or incomplete"');
    expect(html).not.toContain('>BG<');
  });
  it('cannot select a disabled or incomplete translation even via its handler', () => {
    const select = vi.fn();
    const element = CardLanguages({ languages: ['en', 'de'], translations: { en }, displayed: 'en', busy: false, onSelect: select });
    const buttons = element.props.children;
    buttons[1].props.onClick();
    expect(select).not.toHaveBeenCalled();
    buttons[0].props.onClick();
    expect(select).toHaveBeenCalledWith('en');
  });
});

describe('deck language validation', () => {
  it('defaults new decks to English and accepts canonical regional codes', () => {
    expect(deckLanguages({})).toEqual({ primaryLanguage: 'en', supportedLanguages: ['en'] });
    expect(deckLanguages({ primaryLanguage: 'pt-BR', supportedLanguages: ['pt-BR', 'de'] }).primaryLanguage).toBe('pt-BR');
    for (const code of ['de', 'zh-Hant', 'sr-Latn-RS']) expect(isLanguage(code)).toBe(true);
  });
  it('rejects missing primary, duplicates and malformed codes', () => {
    for (const supportedLanguages of [['bg'], ['en', 'en'], ['en', 'invalid_code']]) {
      expect(() => deckLanguages({ primaryLanguage: 'en', supportedLanguages })).toThrow();
    }
  });
  it('allows untranslated cards and later translations but prevents unsupported writes and data loss', () => {
    const card = { primary_language: 'en', translations: { en } };
    expect(() => validateCardLanguages(card, decks[0])).not.toThrow();
    expect(() => validateCardLanguages({ ...card, translations: { en, bg } }, decks[0])).not.toThrow();
    expect(() => validateCardLanguages({ ...card, translations: { en, de } }, decks[0])).toThrow();
    expect(() => validateLanguageChange({}, decks[0], { ...decks[0], supportedLanguages: ['en'] }, [{ ...card, translations: { en, bg } }])).toThrow();
  });
  it('requires complete new originals and an explicit decision to change primary', () => {
    const next = { ...decks[0], primaryLanguage: 'bg' };
    expect(() => validateLanguageChange({}, decks[0], next, [{ primary_language: 'en', translations: { en, bg } }])).toThrow();
    expect(() => validateLanguageChange({ confirmPrimaryLanguageChange: true }, decks[0], next, [{ primary_language: 'en', translations: { en } }])).toThrow();
    expect(() => validateLanguageChange({ confirmPrimaryLanguageChange: true }, decks[0], next, [{ primary_language: 'en', translations: { en, bg } }])).not.toThrow();
  });
});

it('respects a declared original language in legacy Markdown instead of guessing English', () => {
  const parsed = parseMarkdown('---\nprimaryLanguage: de\n---\n## Frage?\n\nAntwort.');
  const plan = planImport(parsed, [], {}, {});
  expect(plan.changed[0]).toMatchObject({ primary_language: 'de', translations: { de: { question: 'Frage?', answer: 'Antwort.' } } });
});
