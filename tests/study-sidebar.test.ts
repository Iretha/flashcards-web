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

it('starts collapsed and renders accessible names for all five actions', () => {
  const html = render();
  expect(html).toContain('aria-controls="study-sidebar-actions" aria-expanded="false"');
  expect(html).toContain('aria-label="Study actions" hidden=""');
  expect(html).toContain('aria-label="Previous" aria-disabled="true"');
  for (const label of ['Show answer', 'Learned', 'Repeat', 'Next']) {
    expect(html).toContain(`aria-label="${label}" aria-disabled="false"`);
  }
});

it('localizes the revealed and historical actions using the selected study language', () => {
  const html = render({ language: 'bg', answerVisible: true, historical: true, hasPrevious: true });
  expect(html).toContain('aria-label="Скрий отговора" aria-disabled="false"');
  expect(html).toContain('role="tooltip" aria-hidden="true">Скрий отговора</span>');
  expect(html).toContain('aria-label="Предишна" aria-disabled="false"');
  expect(html).toContain('aria-label="Научена" aria-disabled="true"');
  expect(html).toContain('aria-label="Повтори" aria-disabled="true"');
});

it('marks every action unavailable during a pending request', () => {
  expect(render({ busy: true, hasPrevious: true }).match(/aria-disabled="true"/g)).toHaveLength(5);
});
