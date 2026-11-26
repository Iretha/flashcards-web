import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { parseMarkdown, questionKey } from '../src/lib/markdown';
import { planImport } from '../src/server/import-plan';

const file = (body: string, version = 4) => `---\nformatVersion: ${version}\nprimaryLanguage: de\n---\n## card: one\n### cardType: question\n### topic: Test\n${version === 3 ? '### occurrenceCount: 0\n' : ''}### provenance\ntype: generated\nsources: []\n### de\n#### question\nFrage?${body}`;
it.each([1,2,6,undefined])('rejects unsupported/missing version %s', version => {
 expect(() => parseMarkdown(version === undefined ? '## Question' : `---\nformatVersion: ${version}\n---`)).toThrow(/v3 and v4/);
});
it.each([3,4])('parses supported format %s and preserves fences', version => {
 const parsed = parseMarkdown(file('\n#### answer\n~~~md\n## card: literal\n#### example\n~~~', version));
 expect(parsed.cards[0]).not.toHaveProperty('error');
 expect(parsed.cards[0].translations.de.answer).toContain('#### example');
});
it.each(['simple','example','details'])('rejects retired %s', field => {
 expect(parseMarkdown(file(`\n#### ${field}\nLost content`)).cards[0].error).toMatch(/belong in answer/);
});
it.each([3,4])('distinguishes missing/empty answers for format %s', version => {
 const current = {id:'id',import_key:'one',primary_language:'de',translations:{de:{question:'Frage?',answer:'Keep'}},interview_priority:null,difficulty:null};
 for (const [body,expected] of [['','Keep'],['\n#### answer',''],['\n#### answer\nReplace','Replace']]) {
  const plan = planImport(parseMarkdown(file(body,version)),[current],{}, {'0:de':'update'});
  expect(plan.cards[0].translations.de.answer).toBe(expected);
  expect(plan.cards[0].id).toBe('id');
  expect(planImport(parseMarkdown(file(body,version)),plan.cards,{},{}).rows.find(r=>r.language==='de')?.kind).toBe('duplicate');
 }
 expect(planImport(parseMarkdown(file('',version)),[],{},{}).cards[0].translations.de.answer).toBe('');
});
it.each(['FLASHCARDS-IMPORT-TEMPLATE.md','FLASHCARDS-V4-EXAMPLE.md','FLASHCARDS-V3-REFERENCE.md'])('validates documented %s through the production parser', file => {
 const parsed = parseMarkdown(readFileSync('docs/'+file,'utf8'));
 expect(parsed.version).toBe(file.includes('V3')?3:4); expect(parsed.cards.length).toBeGreaterThan(0);
 expect(parsed.cards.every(c=>!c.error)).toBe(true);
});
it('normalizes Unicode, whitespace and case for active matching',()=>{
 expect(questionKey('  \uFF34\uFF25\uFF33\uFF34\t card ')).toBe('test card');
});

it.each(['en','bg','de','fr','es','en-US','pt-BR','zh-Hant'])('accepts first language %s for both supported formats',language=>{
 for(const version of [3,4]) {
  const source=file('',version).replace('primaryLanguage: de',`primaryLanguage: ${language}`).replace('### de',`### ${language}`);
  expect(parseMarkdown(source).cards[0]).not.toHaveProperty('error');
 }
});
it('rejects authored v4 occurrence count and contradictory generated evidence',()=>{
 expect(parseMarkdown(file('').replace('### topic: Test','### topic: Test\n### occurrenceCount: 0')).cards[0].error).toContain('derived');
 const source=file('').replace('sources: []','sources:\n  - sourceName: Evidence\n    sourceUrl: https://example.com\n    occurrenceId: interview');
 expect(parseMarkdown(source).cards[0].error).toContain('generated');
});

it.each([3,4])('preserves ordinary Markdown headings within fields in v%s', version => {
 const question = 'Frage?\n## Context\n### Background\n#### Clarification';
 const answer = 'Answer\n## Overview\n### Reasoning\n#### unsupported\nStill answer content';
 const parsed = parseMarkdown(file('\n## Context\n### Background\n#### Clarification\n#### answer\n'+answer, version));
 expect(parsed.cards[0]).not.toHaveProperty('error');
 expect(parsed.cards[0].translations.de).toEqual({question, answer});
});
it.each([3,4])('rejects retired structural fields after an answer in v%s', version => {
 for (const field of ['simple','example','details']) {
  expect(parseMarkdown(file('\n#### answer\nAnswer\n#### '+field+'\nRetired', version)).cards[0].error).toMatch(/belong in answer/);
 }
 expect(parseMarkdown(file('',version).replace('#### question','#### unsupported')).cards[0].error).toBeTruthy();
});
