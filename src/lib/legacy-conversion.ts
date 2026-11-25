import { stringify } from 'yaml';
import { parseMarkdown } from './markdown';
import { parseMarkdownYaml } from './markdown-yaml';
import { normalizeTopics } from './classification';
import { validateCanonicalMetadata } from './metadata';
import { isLanguage, validateFinalTranslations } from './translations';
import { MAX_MARKDOWN_BYTES, MARKDOWN_SIZE_ERROR } from './import-limits';

function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && equal(Reflect.get(a, key), Reflect.get(b, key)));
}

/** Conversion only. The output still requires normal v5 preview and explicit import. */
export function convertLegacyMarkdown(source: string) {
  if (new TextEncoder().encode(source).byteLength > MAX_MARKDOWN_BYTES) throw new Error(MARKDOWN_SIZE_ERROR);
  const original = parseMarkdown(source);
  if (original.version === 5) throw new Error('Already v5: preview this document directly; do not convert again.');
  if (!original.cards.length || original.cards.length > 1000) throw new Error('Include between 1 and 1000 cards in an explicit v3/v4 deck.');
  const sourceLines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const end = sourceLines.findIndex((line, index) => index > 0 && line.trim() === '---');
  const firstCard = sourceLines.findIndex((line, index) => index > end && /^ {0,3}##\s+card:/.test(line));
  if (sourceLines.slice(end + 1, firstCard).some(line => line.trim())) throw new Error('preamble: content before the first card cannot be represented in v5; retain notes separately before conversion.');
  const header = parseMarkdownYaml(sourceLines.slice(1, end).join('\n')) as Record<string, unknown>;
  const unknown = Object.keys(header).find(key => !['formatVersion', 'deckId', 'title', 'description', 'visibility', 'primaryLanguage', 'supportedLanguages'].includes(key));
  if (unknown) throw new Error(`frontmatter.${unknown}: unsupported field; retain it outside the import deck and review before conversion.`);
  for (const [field, limit] of [['deckId', 160], ['title', 160], ['description', 2000]] as const) {
    const value = header[field];
    if (value !== undefined && (typeof value !== 'string' || value.length > limit || (field !== 'description' && !value.trim()))) throw new Error(`frontmatter.${field}: expected ${field === 'description' ? 'text' : 'nonblank text'} of at most ${limit} characters.`);
  }
  if (header.visibility !== undefined && !['PRIVATE', 'SHARED'].includes(String(header.visibility).toUpperCase())) throw new Error('frontmatter.visibility: expected PRIVATE or SHARED.');
  if (header.primaryLanguage !== undefined && !isLanguage(header.primaryLanguage)) throw new Error('frontmatter.primaryLanguage: expected canonical BCP 47 code.');
  if (header.supportedLanguages !== undefined) {
    const supported = header.supportedLanguages;
    if (!Array.isArray(supported) || !supported.length || !supported.every(isLanguage) || new Set(supported).size !== supported.length || (header.primaryLanguage !== undefined && !supported.includes(header.primaryLanguage))) throw new Error('frontmatter.supportedLanguages: supply unique canonical BCP 47 codes including primaryLanguage.');
  }
  const invalid = original.cards.filter(card => card.error);
  if (invalid.length) throw new Error(invalid.map(card => `${card.error}; correct the source before conversion.`).join('\n'));
  const diagnostics: string[] = [];
  const expected = original.cards.map(card => {
    const authored = card.legacyMetadata!;
    const metadata = {
      cardType: authored.cardType === 'coding_task' ? 'task' : 'question',
      provenance: authored.provenance,
      // Legacy metadata was replaced as a unit: absent references cleared it.
      answerReferences: authored.answerReferences ?? [],
    };
    let topics: string[];
    try {
      topics = normalizeTopics([authored.topic]);
      validateCanonicalMetadata(metadata);
      validateFinalTranslations(Object.fromEntries(Object.entries(card.translations).map(([language, value]) => [language, { ...value, answer: value.answer ?? '' }])), metadata.cardType as 'question' | 'task');
    } catch (reason) { throw new Error(`Card ${card.key} — ${reason instanceof Error ? reason.message : reason}; review source evidence/task details before conversion. No data was removed.`); }
    return { key: card.key, translations: card.translations, canonical: {
      topics, priority: 3, metadata,
      ...(Object.hasOwn(authored, 'difficulty') ? { difficulty: card.difficulty } : {}),
    } };
  });
  const blocks = expected.map((card, index) => {
    const { canonical, translations } = card;
    const lines = [`## card: ${card.key}`, '### topics', stringify(canonical.topics).trimEnd(), '### priority: 3', `### cardType: ${canonical.metadata.cardType}`, '### provenance', stringify(canonical.metadata.provenance).trimEnd(), '### answerReferences', stringify(canonical.metadata.answerReferences).trimEnd()];
    const before = original.cards[index];
    if (before.interviewPriority !== undefined) diagnostics.push(`Card ${card.key} — interviewPriority: omitted legacy value ${before.interviewPriority}; priority defaults to 3.`);
    if (Object.hasOwn(before.legacyMetadata!, 'occurrenceCount')) diagnostics.push(`Card ${card.key} — occurrenceCount: validated ${before.legacyMetadata!.occurrenceCount}; omitted as derived, occurrence IDs retained.`);
    if (canonical.difficulty !== undefined) lines.push(`### difficulty: ${canonical.difficulty}`);
    for (const [language, translation] of Object.entries(translations)) {
      lines.push(`### ${language}`, '#### question', translation.question);
      if (translation.questionDetails !== undefined) lines.push('#### questionDetails', translation.questionDetails);
      if (translation.answer !== undefined) lines.push('#### answer', translation.answer);
    }
    return lines.join('\n');
  });
  const markdown = `---\n${stringify({ ...header, formatVersion: 5 })}---\n${blocks.join('\n\n')}\n`;
  if (new TextEncoder().encode(markdown).byteLength > MAX_MARKDOWN_BYTES) throw new Error(MARKDOWN_SIZE_ERROR);
  const converted = parseMarkdown(markdown);
  if (converted.cards.length !== expected.length) throw new Error('cards: serialization changed card boundaries; review reserved headings.');
  converted.cards.forEach((card, index) => {
    if (card.error) throw new Error(`${card.error}; conversion requires source review.`);
    const before = expected[index];
    if (!equal({ key: card.key, translations: card.translations, canonical: card.canonical }, before)) throw new Error(`Card ${before.key} — semantic/presence mismatch after serialization; review reserved headings and metadata. No import output accepted.`);
  });
  diagnostics.push('Validated v5 semantic and presence round-trip. Omitted difficulty, answers, details and languages remain omitted; likelihood/creationMode remain omitted (create defaults 3/UNKNOWN, updates preserve). Legacy unit metadata emits full type/provenance/references; absent references explicitly clear to []. Review normal import preview before applying.');
  return { markdown, diagnostics };
}
