import { expect, it } from 'vitest';
import { convertLegacyMarkdown } from '../src/lib/legacy-conversion';
import { parseMarkdown } from '../src/lib/markdown';
const source = `---
formatVersion: 4
primaryLanguage: en
---
## card: a
### cardType: question
### topic: SQL; JDBC
### interviewPriority: 5
### provenance
type: generated
sources: []
### en
#### question
Question?
#### answer
`;
it('preserves scalar topics, empty answers and reports omitted raw priority', () => {
 const result = convertLegacyMarkdown(source);
 const card = parseMarkdown(result.markdown).cards[0];
 expect(card.error).toBeUndefined();
 expect(card.canonical?.topics).toEqual(['SQL; JDBC']);
 expect(card.translations.en.answer).toBe('');
 expect(result.diagnostics[0]).toContain('value 5');
 expect(() => convertLegacyMarkdown(result.markdown)).toThrow('Already v5');
});
it('blocks unsupported metadata without dropping it', () => {
 expect(() => convertLegacyMarkdown(source.replace('### topic:', '### unknown:'))).toThrow('unsupported');
});
