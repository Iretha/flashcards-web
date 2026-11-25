import type { Language } from '../lib/translations';
import { buildChatGptPrompt } from '../lib/chatgpt';
import { aiProviders, buildAiUrl } from '../lib/ai-providers';

export default function AskChatGpt({ question, language, instructions }: { question: string; language: Language; instructions?: string }) {
  const label = language === 'bg' ? 'Попитай ChatGPT за този въпрос' : 'Ask ChatGPT about this question';
  const prompt = buildChatGptPrompt(question, language, instructions);
  return <span className="ai-providers">{aiProviders.map(provider => <a key={provider.id} className="ask-chatgpt" href={buildAiUrl(provider.id, prompt)}
    target="_blank" rel="noopener noreferrer" aria-label={provider.id === 'chatgpt' ? label : `Ask ${provider.name} about this question`} title={provider.name}
    onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {provider.id === 'chatgpt' ? [0, 60, 120, 180, 240, 300].map(angle => <path key={angle} transform={`rotate(${angle} 12 12)`} d="M12 3a5 5 0 0 1 5 5v6l-5 3-5-3V8l5-3 5 3" />) : provider.id === 'perplexity' ? <path d="M12 2v20M4 5l16 14V5L4 19V5Zm0 7h16" /> : <path d="m12 2 1 7 6-5-4 7 7 1-7 2 4 6-6-4-1 6-2-7-7 4 5-6-6-1 7-2-4-6 6 5Z" />}
    </svg>
  </a>)}</span>;
}
