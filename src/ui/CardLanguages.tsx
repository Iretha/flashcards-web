import { completeTranslation } from '../lib/translations';
import type { Translations } from '../lib/translations';

export default function CardLanguages({ languages, translations, cardType, displayed, busy, onSelect }: {
  languages: string[]; translations: Translations; cardType?: string; displayed: string; busy: boolean; onSelect: (language: string) => void;
}) {
  return <div className="row language-controls" role="group" aria-label="Card language">
    {languages.map(language => {
      const available = completeTranslation(translations[language], cardType);
      return <button key={language} type="button" disabled={busy || !available} aria-pressed={displayed === language}
        title={available ? language.toUpperCase() : `${language.toUpperCase()} translation unavailable or incomplete`}
        onClick={() => { if (!busy && available) onSelect(language); }}>{language.toUpperCase()}</button>;
    })}
  </div>;
}
