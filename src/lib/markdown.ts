import { parse } from 'yaml';

export interface Draft { question: string; answer: string }
export interface ImportCard extends Draft { id: string; question_key: string }
export const questionKey = (value: string) => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

export function parseMarkdown(source: string) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const metadata: Record<string, string> = {};
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (end < 0) throw new Error('The Markdown frontmatter is missing its closing delimiter.');
    const data: unknown = parse(lines.splice(0, end + 1).slice(1, -1).join('\n'), { maxAliasCount: 0 });
    if (data && typeof data === 'object') {
      for (const key of ['deckId', 'title', 'description']) {
        const value: unknown = Reflect.get(data, key);
        if (typeof value === 'string') metadata[key] = value.trim();
      }
    }
  }
  const cards: Draft[] = [];
  let question: string | undefined;
  let answer: string[] = [];
  let fence: string | undefined;
  function finish() {
    if (question !== undefined) cards.push({ question, answer: answer.join('\n').trim() });
    question = undefined;
    answer = [];
  }
  for (const line of lines) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      answer.push(line);
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    if (marker) fence = marker[1];
    const heading = /^ {0,3}##(?:\s+|$)(.*)$/.exec(line);
    if (heading || /^ {0,3}---\s*$/.test(line)) {
      finish();
      if (heading) question = heading[1].replace(/\s+#+\s*$/, '').trim();
    } else if (question !== undefined) answer.push(line);
  }
  finish();
  return { metadata, cards };
}

export function compareImport(drafts: Draft[], existing: ImportCard[]) {
  const known = new Map(existing.map(card => [card.question_key, card]));
  const seen = new Set<string>();
  return drafts.map((draft, index) => {
    const key = questionKey(draft.question);
    const current = known.get(key);
    const pair = JSON.stringify([key, draft.answer]);
    let kind: 'invalid' | 'duplicate' | 'conflict' | 'new';
    if (!key || !draft.answer || draft.question.length > 2000 || draft.answer.length > 20000) kind = 'invalid';
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
