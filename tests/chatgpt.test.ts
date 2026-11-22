import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { buildChatGptPrompt, buildChatGptUrl, defaultInstructions } from '../src/lib/chatgpt';
import { selectTranslation } from '../src/lib/translations';
import AskChatGpt from '../src/ui/AskChatGpt';

it('preserves Cyrillic in universal defaults and the Bulgarian prompt heading', () => {
  const instructions = defaultInstructions({ chatgpt_default: 'universal' }, 'bg');
  expect(instructions).toContain('Обясни въпроса точно, ясно и логично.');
  expect(instructions).not.toContain('??');
  expect(buildChatGptPrompt('Тест', 'bg', instructions)).toContain('Въпрос:');
});

it.each(['en', 'bg'] as const)('encodes only the selected question in %s', language => {
  const translations = { en: { question: 'Java & ? # + "\ninterfaces', answer: 'SECRET ANSWER', questionDetails: 'SECRET NOTES' }, bg: { question: 'Какво е Java?', answer: 'SECRET BG' } };
  const question = selectTranslation(translations, language).translation!.question;
  const prompt = buildChatGptPrompt(question, language);
  expect(prompt).toContain(`"${question}"`);
  expect(prompt).not.toContain('SECRET');
  expect(prompt).toContain(language === 'en' ? 'Respond entirely in English.' : 'Отговори изцяло на български език');
  expect(new URL(buildChatGptUrl(prompt)).searchParams.get('q')).toBe(prompt);
  const html = renderToStaticMarkup(createElement(AskChatGpt, { question, language }));
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain(language === 'en' ? 'Ask ChatGPT about this question' : 'Попитай ChatGPT за този въпрос');
});

it('retains Bulgarian instructions with the existing English fallback', () => {
  const selected = selectTranslation({ en: { question: 'Fallback question', answer: 'Private answer' } }, 'bg');
  const prompt = buildChatGptPrompt(selected.translation!.question, 'bg');
  expect(prompt).toContain('Fallback question');
  expect(prompt).toContain('Отговори изцяло на български език');
  expect(prompt).not.toContain('Private answer');
});

it('stops bubbling without cancelling native link navigation', () => {
  const link = AskChatGpt({ question: 'Java?', language: 'en' }).props.children[0];
  let stopped = false;
  link.props.onClick({ stopPropagation() { stopped = true; } });
  expect(stopped).toBe(true);
  expect(link.type).toBe('a');
});
