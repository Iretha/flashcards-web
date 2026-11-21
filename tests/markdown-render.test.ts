import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import MarkdownContent from '../src/ui/MarkdownContent';

it('renders Markdown and code without executing HTML or unsafe URLs', () => {
  const html = renderToStaticMarkup(createElement(MarkdownContent, {
    children: '**bold**\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29)\n\n~~~html\n<script>literal</script>\n~~~',
  }));
  expect(html).toContain('<strong>bold</strong>');
  expect(html).toContain('&lt;script&gt;literal&lt;/script&gt;');
  expect(html).not.toMatch(/<script|<img|onerror|javascript:/i);
});
