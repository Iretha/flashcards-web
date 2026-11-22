import type { Language } from '../lib/translations';
import { buildChatGptPrompt, buildChatGptUrl } from '../lib/chatgpt';

export default function AskChatGpt({ question, language }: { question: string; language: Language }) {
  const label = language === 'bg' ? 'Попитай ChatGPT за този въпрос' : 'Ask ChatGPT about this question';
  return <a className="ask-chatgpt" href={buildChatGptUrl(buildChatGptPrompt(question, language))}
    target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
    onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} transform={`rotate(${angle} 12 12)`} d="M12 3a5 5 0 0 1 5 5v6l-5 3-5-3V8l5-3 5 3" />)}
    </svg>
  </a>;
}
