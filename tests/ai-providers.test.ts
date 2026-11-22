import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { aiProviders, buildAiUrl } from '../src/lib/ai-providers';
import { buildChatGptPrompt, buildChatGptUrl, effectiveInstructions } from '../src/lib/chatgpt';
import AskChatGpt from '../src/ui/AskChatGpt';

it.each(['bg', 'de', 'en'])('preserves Unicode, instructions and encoding for %s', language => {
  const question = 'Какво е CPU? Größe & water + # / % "\n🌍';
  const instructions = effectiveInstructions({ chatgpt_en: 'Custom English', chatgpt_bg: 'Обясни ясно.' }, language);
  const prompt = buildChatGptPrompt(question, language, instructions);
  expect(prompt).toContain(question);
  expect(prompt).toContain(instructions);
  for (const provider of aiProviders) {
    const url = buildAiUrl(provider.id, prompt);
    expect(url).toBe(provider.url + encodeURIComponent(prompt));
    expect(new URL(url).searchParams.get('q')).toBe(prompt);
  }
  expect(buildChatGptUrl(prompt)).toBe(buildAiUrl('chatgpt', prompt));
});

it('renders ordered native links in new tabs with identical prompts', () => {
  const props = { question: 'Which planet?', language: 'en', instructions: 'Explain simply.' };
  const element = AskChatGpt(props);
  const links = element.props.children;
  expect(links).toHaveLength(3);
  links.forEach((link: { type: string; props: { href: string; target: string; rel: string; title: string; onClick: (event: { stopPropagation: () => void }) => void } }, index: number) => {
    expect(link.type).toBe('a');
    expect(link.props.href).toBe(buildAiUrl(aiProviders[index].id, buildChatGptPrompt(props.question, props.language, props.instructions)));
    expect(link.props.target).toBe('_blank');
    expect(link.props.rel).toBe('noopener noreferrer');
    expect(link.props.title).toBe(aiProviders[index].name);
    let stopped = false;
    link.props.onClick({ stopPropagation() { stopped = true; } });
    expect(stopped).toBe(true);
  });
  expect(renderToStaticMarkup(createElement(AskChatGpt, props))).toContain('Claude');
});
