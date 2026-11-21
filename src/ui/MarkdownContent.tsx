import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import Prism from 'prismjs';
import type { TokenStream } from 'prismjs';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';

// React owns the DOM. Use Prism only to tokenize the source text.
Prism.manual = true;

const grammars = new Map([
  ['java', Prism.languages.java],
  ['sql', Prism.languages.sql],
  ['javascript', Prism.languages.javascript],
  ['js', Prism.languages.javascript],
  ['json', Prism.languages.json],
  ['bash', Prism.languages.bash],
  ['sh', Prism.languages.bash],
  ['shell', Prism.languages.bash],
]);

function renderTokens(tokens: TokenStream) {
  return tokens.map((token, index) => {
    if (typeof token === 'string') return token;
    const classes = ['token', token.type].concat(token.alias ?? []);
    const content = typeof token.content === 'string' ? token.content : renderTokens(token.content);
    return <span key={index} className={classes.join(' ')}>{content}</span>;
  });
}

const components: Components = {
  pre: ({ children }) => <pre className="code-block" tabIndex={0}>{children}</pre>,
  code: ({ className, children }) => {
    const language = className?.match(/^language-(\S+)$/)?.[1].toLowerCase();
    const grammar = language && grammars.get(language);
    const content = grammar && typeof children === 'string'
      ? renderTokens(Prism.tokenize(children, grammar))
      : children;
    return <code className={className}>{content}</code>;
  },
};

export default function MarkdownContent({ children }: { children?: string }) {
  return <ReactMarkdown skipHtml components={components}>{children}</ReactMarkdown>;
}
