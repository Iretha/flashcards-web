import { parseStructured } from './markdown-v3';
import { parseV5 } from './markdown-v5';
import { parseMarkdownYaml } from './markdown-yaml';
export const questionKey = (value: string) => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

export function parseMarkdown(source: string) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const metadata: Record<string, string> = {};
  let version: 3 | 4 | 5 | undefined;
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (end < 0) throw new Error('The Markdown frontmatter is missing its closing delimiter.');
    const raw = lines.splice(0, end + 1).slice(1, -1).join('\n');
    const data: unknown = parseMarkdownYaml(raw);
    if (data && typeof data === 'object') {
      const declared: unknown = Reflect.get(data, 'formatVersion');
      if (declared === 5) version = 5;
      else if (declared === 4 || declared === '4') version = 4;
      else if (declared === 3 || declared === '3') version = 3;
      else throw new Error('Unsupported Markdown formatVersion. Standard import requires v5; legacy v3 and v4 require conversion. v1/v2 require separately prepared conversion.');
      if (version === 5) {
        const unknown = Object.keys(data).find(key => !['formatVersion', 'deckId', 'title', 'description', 'visibility', 'primaryLanguage', 'supportedLanguages'].includes(key));
        if (unknown) throw new Error(`Unsupported frontmatter field: ${unknown}`);
        for (const key of ['deckId', 'title', 'description', 'visibility', 'primaryLanguage']) {
          if (Reflect.get(data, key) !== undefined && typeof Reflect.get(data, key) !== 'string') throw new Error(`${key} must be a string.`);
        }
      }
      for (const key of ['deckId', 'title', 'description', 'visibility', 'primaryLanguage']) {
        const value: unknown = Reflect.get(data, key);
        if (typeof value === 'string') metadata[key] = value.trim();
      }
      const supported: unknown = Reflect.get(data, 'supportedLanguages');
      if (supported !== undefined) {
        if (!Array.isArray(supported) || !supported.every(code => typeof code === 'string')) throw new Error('supportedLanguages must be a list of language codes.');
        metadata.supportedLanguages = JSON.stringify(supported);
      }
    }
  }
  if (!version) throw new Error('Explicit formatVersion required. Standard import requires v5; legacy v3 and v4 require conversion.');
  return { version, metadata, cards: version === 5 ? parseV5(lines) : parseStructured(lines, version) };
}
