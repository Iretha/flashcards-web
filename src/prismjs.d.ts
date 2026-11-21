declare module 'prismjs' {
  export type TokenStream = (string | Token)[];

  interface Token {
    type: string;
    content: string | TokenStream;
    alias?: string | string[];
  }

  const Prism: {
    manual: boolean;
    languages: Record<string, object>;
    tokenize(code: string, grammar: object): TokenStream;
  };

  export default Prism;
}

declare module 'prismjs/components/prism-java.js';
declare module 'prismjs/components/prism-sql.js';
declare module 'prismjs/components/prism-json.js';
declare module 'prismjs/components/prism-bash.js';
declare module 'prismjs/components/prism-typescript.js';
declare module 'prismjs/components/prism-yaml.js';
