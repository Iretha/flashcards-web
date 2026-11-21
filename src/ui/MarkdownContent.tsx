import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import type { TokenStream } from 'prismjs';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-yaml.js';

// React owns the DOM. Use Prism only to tokenize the source text.
Prism.manual = true;

const languages = new Map(
  [
    ['JAVA', 'java'], ['SQL', 'sql'], ['JAVASCRIPT', 'javascript', 'js'],
    ['TYPESCRIPT', 'typescript', 'ts'], ['JSON', 'json'],
    ['HTML', 'markup', 'markup'], ['XML', 'markup'],
    ['CSS', 'css'], ['BASH', 'bash', 'sh', 'shell', 'zsh'], ['YAML', 'yaml', 'yml'],
  ].flatMap(([label, grammar, ...aliases]) => [label.toLowerCase(), ...aliases]
    .map(alias => [alias, { grammar: Prism.languages[grammar], label }] as const)),
);

function renderTokens(tokens: TokenStream) {
  return tokens.map((token, index) => {
    if (typeof token === 'string') return token;
    const classes = ['token', token.type].concat(token.alias ?? []);
    const content = typeof token.content === 'string' ? token.content : renderTokens(token.content);
    return <span key={index} className={classes.join(' ')}>{content}</span>;
  });
}

const components: Components = {
  pre: ({ node, children }) => {
    const code = node?.children[0];
    const classes = code?.type === 'element' ? code.properties.className : undefined;
    const language = Array.isArray(classes) ? languageName(classes.join(' ')) : undefined;
    const label = language && (languages.get(language)?.label ?? language.toUpperCase());
    return <div className="code-frame">
      {label && <span className="code-language">{label}</span>}
      <pre className="code-block" tabIndex={0}>{children}</pre>
    </div>;
  },
  code: ({ className, children }) => {
    const language = languageName(className);
    const grammar = language && languages.get(language)?.grammar;
    const content = grammar && typeof children === 'string'
      ? renderTokens(Prism.tokenize(children, grammar))
      : children;
    return <code className={className}>{content}</code>;
  },
  table: ({ children }) => <div className="markdown-table"><table>{children}</table></div>,
};

function languageName(className?: string) {
  return className?.match(/^language-(\S+)$/)?.[1].toLowerCase();
}

export default memo(function MarkdownContent({ children }: { children?: string }) {
  return <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown>;
});
