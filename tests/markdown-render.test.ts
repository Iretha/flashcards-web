import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import MarkdownContent from '../src/ui/MarkdownContent';

function render(children: string) {
  return renderToStaticMarkup(createElement(MarkdownContent, { children }));
}

it('renders Markdown and code without executing HTML or unsafe URLs', () => {
  const html = renderToStaticMarkup(createElement(MarkdownContent, {
    children: '**bold**\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert%281%29)\n\n~~~html\n<script>literal</script>\n~~~',
  }));
  expect(html).toContain('<strong>bold</strong>');
  expect(html).toContain('&lt;script&gt;literal&lt;/script&gt;');
  expect(html).not.toMatch(/<script|<img|onerror|javascript:/i);
});

it('highlights Java generics, annotations, lambdas, comments and strings without changing whitespace', () => {
  const source = '@Override\n  List<String> names = items.map(item -> "<tag>" + item);\n\n\t// keep this comment';
  const html = render(`\x60\x60\x60java\n${source}\n\x60\x60\x60`);
  expect(html).toContain('class="token generics"');
  expect(html).toContain('class="token annotation punctuation">@Override</span>');
  expect(html).toContain('class="token operator">-&gt;</span>');
  expect(html).toContain('class="token string">&quot;&lt;tag&gt;&quot;</span>');
  expect(html).toContain('class="token comment">// keep this comment</span>');
  expect(html.replace(/<[^>]+>/g, '')).toBe(source.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '\n');
});

it.each([
  ['sql', "SELECT 'name' FROM users;", 'keyword', 'SELECT'],
  ['javascript', 'const value = 42;', 'keyword', 'const'],
  ['json', '{"value": 42}', 'number', '42'],
  ['bash', 'echo "$HOME"', 'builtin class-name', 'echo'],
])('highlights %s code', (language, source, token, value) => {
  expect(render(`~~~${language}\n${source}\n~~~`)).toContain(`class="token ${token}">${value}</span>`);
});

it('renders inline code within ordinary text', () => {
  expect(render('Call `List<String>` first.')).toBe('<p>Call <code>List&lt;String&gt;</code> first.</p>');
});

it('puts long lines in a focusable code block without inserting breaks', () => {
  const line = 'x'.repeat(500);
  expect(render(`~~~\n${line}\n~~~`)).toBe(`<pre class="code-block" tabindex="0"><code>${line}\n</code></pre>`);
});

it.each(['', 'unknown', 'constructor'])('preserves plain code for the fence language "%s"', language => {
  const html = render(`~~~${language}\n  <tag>\n\n    value\n~~~`);
  expect(html).toContain('>  &lt;tag&gt;\n\n    value\n</code>');
  expect(html).not.toContain('<span');
});
