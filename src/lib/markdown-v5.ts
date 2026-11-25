import { parse } from 'yaml';
import { normalizeTopics, validateCardType, validateCreationMode, validateRating } from './classification';
import { applyCanonicalMetadataPatch, validateCanonicalMetadata } from './metadata';
import { parseLanguages } from './markdown-languages';
import type { ImportDraft } from './markdown-languages';
import { isLanguage, validateFinalTranslations } from './translations';

const yaml = (source: string) => parse(source, { maxAliasCount: 0, schema: 'core' });
const reserved = /^(topics|priority|likelihood|creationMode|cardType|difficulty|provenance|answerReferences)(?::|\s*$)/;

export function parseV5(lines: string[]): ImportDraft[] {
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
  return chunks.map(chunk => parseCard(chunk, seen));
}

function parseCard(chunk: string[], seen: Set<string>): ImportDraft {
  const languageLines = [chunk[0]];
  const authored: NonNullable<ImportDraft['canonical']> = {};
  const metadata: Record<string, unknown> = {};
  const fields = new Set<string>();
  let index = 1;
  let error: string | undefined;
  try {
    for (; index < chunk.length; index++) {
      const line = chunk[index];
      const level3 = /^### (\S+)\s*$/.exec(line)?.[1];
      if (level3 && !reserved.test(level3) && isLanguage(level3)) break;
      if (!line.trim()) continue;
      const heading = /^### (topics|priority|likelihood|creationMode|cardType|difficulty|provenance|answerReferences)(?::\s*(.*))?\s*$/.exec(line);
      if (!heading) throw new Error('metadata: unsupported heading or content');
      const [, field, inline] = heading;
      if (fields.has(field)) throw new Error(`${field}: duplicate field`);
      fields.add(field);
      const block = field === 'topics' || field === 'provenance' || field === 'answerReferences';
      if (block && inline !== undefined) throw new Error(`${field}: expected a YAML body`);
      let value: unknown;
      if (block) {
        const body: string[] = [];
        while (index + 1 < chunk.length && !/^### /.test(chunk[index + 1])) body.push(chunk[++index]);
        value = yaml(body.join('\n'));
      } else {
        if (inline === undefined) throw new Error(`${field}: expected a colon and value`);
        value = inline.trim() ? yaml(inline) : null;
      }
      if (field === 'topics') authored.topics = normalizeTopics(value);
      else if (field === 'priority' || field === 'likelihood') authored[field] = value === null ? null : validateRating(value, field);
      else if (field === 'creationMode') authored.creationMode = value === null ? null : validateCreationMode(value, field);
      else if (field === 'cardType') metadata.cardType = validateCardType(value, field);
      else if (field === 'difficulty') {
        if (value !== null) validateRating(value, field);
        authored.difficulty = value as number | null;
      } else if (field === 'provenance') metadata.provenance = value;
      else metadata.answerReferences = value;
    }
    if (Object.keys(metadata).length) {
      // Validate supplied values without inventing omitted patch fields.
      applyCanonicalMetadataPatch(validateCanonicalMetadata({ cardType: 'question' }), metadata);
      authored.metadata = metadata;
    }
  } catch (reason) { error = reason instanceof Error ? reason.message : 'metadata: invalid YAML'; }

  languageLines.push(...chunk.slice(index));
  const card = parseLanguages(languageLines)[0] ?? { key: '', translations: {}, error: 'question: missing language content' };
  card.canonical = authored;
  let contentFence = '';
  for (const line of chunk.slice(index)) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (marker) {
      if (!contentFence) contentFence = marker[1];
      else if (marker[1][0] === contentFence[0] && marker[1].length >= contentFence.length && !marker[2].trim()) contentFence = '';
      continue;
    }
    if (!contentFence && /^ {0,3}### /.test(line) && reserved.test(line.replace(/^ {0,3}### /, ''))) error ??= 'metadata: must precede language sections';
  }
  try {
    const type = metadata.cardType ?? 'question';
    validateFinalTranslations(Object.fromEntries(Object.entries(card.translations).map(([code, value]) => [code, { ...value, answer: value.answer ?? '' }])), type as 'question' | 'task');
  } catch (reason) { error ??= reason instanceof Error ? reason.message : 'translations: invalid'; }
  if (seen.has(card.key)) error ??= 'id: duplicate card key';
  seen.add(card.key);
  if (error || card.error) card.error = `Card ${card.key || '(invalid id)'} — ${error ?? card.error}`;
  return card;
}
