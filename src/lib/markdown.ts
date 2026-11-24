import { parseStructured } from './markdown-v3';
import { parse } from 'yaml';
export const questionKey = (value: string) => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

export function parseMarkdown(source: string) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const metadata: Record<string, string> = {};
  let version: 3 | 4 | undefined;
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (end < 0) throw new Error('The Markdown frontmatter is missing its closing delimiter.');
    const data: unknown = parse(lines.splice(0, end + 1).slice(1, -1).join('\n'), { maxAliasCount: 0 });
    if (data && typeof data === 'object') {
      const declared: unknown = Reflect.get(data, 'formatVersion');
      if (declared === 4 || declared === '4') version = 4;
      else if (declared === 3 || declared === '3') version = 3;
      else throw new Error('Unsupported Markdown formatVersion. Supported formats: v3 and v4.');
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
  if (!version) throw new Error('Explicit formatVersion required. Supported formats: v3 and v4.');
  return { version, metadata, cards: parseStructured(lines, version) };
}
