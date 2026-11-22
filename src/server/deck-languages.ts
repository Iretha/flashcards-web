import { completeTranslation, isLanguage } from '../lib/translations';
import type { Translations } from '../lib/translations';
import { check } from './http';

type Config = { primaryLanguage: string | null; supportedLanguages: string[] };
type Content = { primary_language: string; translations: Translations; metadata?: { cardType: string } | null };

export function deckLanguages(input: Record<string, unknown>, current?: Config | null): Config {
  const primary = input.primaryLanguage === undefined ? (current ? current.primaryLanguage : 'en') : input.primaryLanguage;
  const supported = input.supportedLanguages ?? current?.supportedLanguages ?? [primary];
  const unresolvedLegacy = current?.primaryLanguage === null && input.primaryLanguage === undefined;
  check(unresolvedLegacy || isLanguage(primary), 'primaryLanguage must be a canonical BCP 47 code.');
  check(Array.isArray(supported) && supported.length > 0 && supported.every(isLanguage) && new Set(supported).size === supported.length && (unresolvedLegacy || (typeof primary === 'string' && supported.includes(primary))), 'supportedLanguages must contain unique BCP 47 codes including primaryLanguage.');
  return { primaryLanguage: primary as string | null, supportedLanguages: supported };
}

export function validateCardLanguages(card: Content, config: Config) {
  check(Object.keys(card.translations).every(code => config.supportedLanguages.includes(code)), 'Unsupported deck language.');
  const primary = config.primaryLanguage ?? card.primary_language;
  check(completeTranslation(card.translations[primary], card.metadata?.cardType), 'Complete primary language content is required.');
}

export function validateLanguageChange(input: Record<string, unknown>, current: Config, next: Config, cards: Content[]) {
  for (const card of cards) validateCardLanguages(card, next);
  if (next.primaryLanguage !== current.primaryLanguage && cards.length) {
    check(input.confirmPrimaryLanguageChange === true, 'Confirm the primary language change explicitly; original content will be designated in the new language.');
  }
}
