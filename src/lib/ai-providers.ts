export const aiProviders = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q=' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/search/?q=' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/new?q=' },
] as const;

export type AiProvider = typeof aiProviders[number]['id'];

export function buildAiUrl(provider: AiProvider, prompt: string) {
  return aiProviders.find(item => item.id === provider)!.url + encodeURIComponent(prompt);
}
