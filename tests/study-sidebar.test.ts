import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import StudySidebar from '../src/ui/StudySidebar';

function render(props: Partial<Parameters<typeof StudySidebar>[0]> = {}) {
  return renderToStaticMarkup(createElement(StudySidebar, {
    language: 'en', busy: false, hasPrevious: false, historical: false, answerVisible: false,
    onAction: () => {}, onToggleAnswer: () => {}, ...props,
  }));
}

it('keeps actions visible and renders an accessible repeat button', () => {
  const html = render();
  expect(html).not.toContain('hidden=""');
  expect(html).toContain('aria-label="Study actions"');
  expect(html).toContain('aria-label="Previous" aria-disabled="true"');
  for (const label of ['Show answer', 'Next']) {
    expect(html).toContain(`aria-label="${label}" aria-disabled="false"`);
  }
  expect(html).not.toContain('aria-label="Learned"');
  expect(html).toContain('aria-label="Repeat" aria-pressed="false"');
});

it('localizes the revealed and historical actions using the selected study language', () => {
  const html = render({ language: 'bg', answerVisible: true, historical: true, hasPrevious: true, repeat: true });
  expect(html).not.toContain('type="checkbox"');
  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain('aria-label="Скрий отговора" aria-disabled="false"');
  expect(html).toContain('role="tooltip" aria-hidden="true">Скрий отговора</span>');
  expect(html).toContain('aria-label="Предишна" aria-disabled="false"');
});

it('marks every action unavailable during a pending request', () => {
  expect(render({ busy: true, hasPrevious: true }).match(/aria-disabled="true"/g)).toHaveLength(4);
  expect(render({ busy: true })).toContain('aria-label="Repeat" aria-pressed="false" aria-disabled="true"');
});
