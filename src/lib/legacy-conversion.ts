import { stringify } from 'yaml';
import { parseMarkdown } from './markdown';
import { normalizeTopics } from './classification';

/** Conversion only: callers must explicitly preview and import the returned v5 document. */
export function convertLegacyMarkdown(source: string) {
  const original = parseMarkdown(source);
  if (original.version === 5) throw new Error('Already v5: preview this document directly; do not convert again.');
  if (!original.cards.length) throw new Error('No cards found; prepare an explicit v3/v4 deck.');
  const diagnostics: string[] = [];
  const blocks = original.cards.map(card => {
    if (card.error) throw new Error(`${card.error}; correct the source before conversion.`);
    const metadata = card.metadata!;
    const lines = [`## card: ${card.key}`, '### topics', stringify(normalizeTopics([metadata.topic])).trimEnd(), '### priority: 3', `### cardType: ${metadata.cardType === 'coding_task' ? 'task' : 'question'}`, '### provenance', stringify(metadata.provenance).trimEnd(), '### answerReferences', stringify(metadata.answerReferences ?? []).trimEnd()];
    if (card.interviewPriority !== undefined) diagnostics.push(`Card ${card.key} — interviewPriority: omitted legacy value ${card.interviewPriority}; priority defaults to 3.`);
    if (card.difficulty !== undefined) lines.push(`### difficulty: ${card.difficulty}`);
    for (const [language, translation] of Object.entries(card.translations)) {
      lines.push(`### ${language}`, '#### question', translation.question);
      if (translation.questionDetails !== undefined) lines.push('#### questionDetails', translation.questionDetails);
      if (translation.answer !== undefined) lines.push('#### answer', translation.answer);
    }
    return lines.join('\n');
  });
  const { supportedLanguages, ...metadata } = original.metadata;
  const markdown = `---\n${stringify({ formatVersion: 5, ...metadata, ...(supportedLanguages === undefined ? {} : { supportedLanguages: JSON.parse(supportedLanguages) }) })}---\n${blocks.join('\n\n')}\n`;
  const converted = parseMarkdown(markdown);
  converted.cards.forEach((card, index) => {
    if (card.error) throw new Error(`${card.error}; conversion requires source review.`);
    const before = original.cards[index];
    if (card.key !== before.key || JSON.stringify(card.translations) !== JSON.stringify(before.translations)) throw new Error(`Card ${before.key} — content changed during serialization; review reserved headings.`);
  });
  return { markdown, diagnostics };
}
