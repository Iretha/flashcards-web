import { parse } from 'yaml';
import { parseLanguages } from './markdown-languages';
import type { ImportDraft } from './markdown-languages';
import { isLanguage } from './translations';
import { validateMetadata } from './metadata';

export function parseStructured(lines: string[], version: 3 | 4): ImportDraft[] {
  const chunks: string[][] = [];
  let fence = '';
  for (const line of lines) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (!fence && /^ {0,3}##\s+card:/.test(line)) chunks.push([]);
    chunks.at(-1)?.push(line);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = '';
    }
  }
  const seen = new Set<string>();
  return chunks.map(chunk => {
    const content = [chunk[0]];
    const metadata: Record<string, unknown> = {};
    let error: string | undefined;
    let index = 1;
    try {
      for (; index < chunk.length; index++) {
        const line = chunk[index];
        if (isLanguage(/^### (\S+)\s*$/.exec(line)?.[1])) break;
        if (!line.trim()) continue;
        const heading = /^### (cardType|topic|occurrenceCount|interviewPriority|difficulty|provenance|answerReferences)(?::\s*(.*))?\s*$/.exec(line);
        if (!heading) throw new Error('metadata: unsupported heading or content');
        const [, field, scalar] = heading;
        if (version === 4 && field === 'occurrenceCount') throw new Error('occurrenceCount: derived automatically in v4');
        if (field in metadata) throw new Error(field + ': duplicate field');
        if (field === 'provenance' || field === 'answerReferences') {
          const body: string[] = [];
          while (index + 1 < chunk.length && !/^### /.test(chunk[index + 1])) body.push(chunk[++index]);
          metadata[field] = parse(body.join('\n'), { maxAliasCount: 0 });
        } else {
          metadata[field] = ['occurrenceCount', 'interviewPriority', 'difficulty'].includes(field) ? Number(scalar) : scalar;
          if (['interviewPriority', 'difficulty'].includes(field)) {
            if (!/^[1-5]$/.test(scalar ?? '')) throw new Error(field + ': expected integer 1–5');
            content.push(line);
          }
          if (field === 'occurrenceCount' && !/^\d+$/.test(scalar ?? '')) throw new Error(field + ': expected integer >= 0');
        }
      }
    } catch (reason) { error = reason instanceof Error ? reason.message : 'metadata: invalid YAML'; }
    content.push(...chunk.slice(index));
    const card = parseLanguages(content)[0] ?? { key: '', translations: {}, error: 'question: missing language content' };
    let contentFence = '';
    for (const line of chunk.slice(index)) {
      const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      if (marker) {
        if (!contentFence) contentFence = marker[1];
        else if (marker[1][0] === contentFence[0] && marker[1].length >= contentFence.length && !marker[2].trim()) contentFence = '';
        continue;
      }
      if (contentFence) continue;
      const legacy = /^ {0,3}#### (simple|example|details)\s*$/.exec(line);
      if (legacy) error ??= legacy[1] + ': examples and explanations belong in answer';
      if (/^### (cardType|topic|occurrenceCount|interviewPriority|difficulty|provenance|answerReferences)(:|\s*$)/.test(line)) error ??= 'metadata: must precede language sections';
    }
    const { interviewPriority: _priority, difficulty: _difficulty, ...fields } = metadata;
    try { card.metadata = validateMetadata(fields, version === 3); }
    catch (reason) { error ??= reason instanceof Error ? reason.message : 'metadata: invalid'; }
    for (const [language, translation] of Object.entries(card.translations)) {
      for (const field of ['question', 'answer'] as const) {
        if (field === 'question' && !translation[field]?.trim()) error ??= `${language}.${field}: required nonempty Markdown`;
        if ((translation[field]?.length ?? 0) > (field === 'question' ? 2000 : 20000)) error ??= `${language}.${field}: exceeds character limit`;
      }
      if ((translation.questionDetails?.length ?? 0) > 20000) error ??= `${language}.questionDetails: exceeds 20000 characters`;
    }
    if (seen.has(card.key)) error ??= 'id: duplicate card key';
    seen.add(card.key);
    if (card.metadata?.cardType === 'coding_task' && Object.values(card.translations).some(value => !value.questionDetails?.trim())) error ??= 'questionDetails: coding_task requires a task statement for every language';
    if (error || card.error) card.error = `Card ${card.key || '(invalid id)'} — ${error ?? card.error}`;
    return card;
  });
}
