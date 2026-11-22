import { parseV3 } from './markdown-v3';
import { parse } from 'yaml';
import { parseBilingual } from './markdown-v2';

export interface Draft { question: string; answer: string }
export interface ImportCard extends Draft { id: string; question_key: string }
export const questionKey = (value: string) => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

export function parseMarkdown(source: string) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const metadata: Record<string, string> = {};
  let version: 1 | 2 | 3 = 1;
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (end < 0) throw new Error('The Markdown frontmatter is missing its closing delimiter.');
    const data: unknown = parse(lines.splice(0, end + 1).slice(1, -1).join('\n'), { maxAliasCount: 0 });
    if (data && typeof data === 'object') {
      const declared: unknown = Reflect.get(data, 'formatVersion');
      if (declared === 3 || declared === '3') version = 3;
      else if (declared === 2 || declared === '2') version = 2;
      else if (declared !== undefined && declared !== 1 && declared !== '1') throw new Error('Unsupported Markdown formatVersion.');
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
  if (version === 3) return { version, metadata, cards: parseV3(lines) } as const;
  if (version === 2) return { version, metadata, cards: parseBilingual(lines) } as const;
  const cards: Draft[] = [];
  let question: string | undefined;
  let answer: string[] = [];
  let fence: string | undefined;
  function finish() {
    if (question !== undefined) cards.push({ question, answer: answer.join('\n').trim() });
    question = undefined;
    answer = [];
  }
  for (const [index, line] of lines.entries()) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      answer.push(line);
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    if (marker) fence = marker[1];
    const heading = /^ {0,3}##(?:\s+|$)(.*)$/.exec(line);
    const separator = /^ {0,3}---\s*$/.test(line) &&
      lines.slice(index + 1).find(next => next.trim())?.match(/^ {0,3}##(?:\s+|$)/);
    if (heading || separator) {
      finish();
      if (heading) question = heading[1].replace(/\s+#+\s*$/, '').trim();
    } else if (question !== undefined) answer.push(line);
  }
  finish();
  return { version, metadata, cards } as const;
}

export function compareImport(drafts: Draft[], existing: ImportCard[]) {
  const known = new Map(existing.map(card => [card.question_key, card]));
  const seen = new Set<string>();
  return drafts.map((draft, index) => {
    const key = questionKey(draft.question);
    const current = known.get(key);
    const pair = JSON.stringify([key, draft.answer]);
    let kind: 'invalid' | 'duplicate' | 'conflict' | 'new';
    if (!key || draft.question.length > 2000 || draft.answer.length > 20000) kind = 'invalid';
    else if (seen.has(pair) || current?.answer === draft.answer) kind = 'duplicate';
    else if (current) kind = 'conflict';
    else kind = 'new';
    if (kind !== 'invalid') {
      seen.add(pair);
      if (!current) known.set(key, { ...draft, id: '', question_key: key });
    }
    return { ...draft, index, key, kind, existingAnswer: current?.answer };
  });
}
