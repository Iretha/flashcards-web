import { expect, it } from 'vitest';
import { updateCardSchema, updateMcpCard } from '../src/server/mcp-writes';

it.each([
 {}, {card_id:'a'}, {card_id:'a',answer:''}, {card_id:'a',answer:' '},
 {card_id:'a',answer:'x'.repeat(20001)}, {card_id:'a',answer:'a',question:'q'},
 {card_id:'a',answer:'a',translations:{}},
])('rejects invalid answer-only inputs before database access', async args => {
 await expect(updateMcpCard({} as D1Database,'owner',args)).rejects.toThrow('INVALID_ARGUMENTS');
});
it('accepts explicit and omitted languages', () => {
 expect(updateCardSchema.parse({card_id:'existing',answer:'answer'})).toEqual({card_id:'existing',answer:'answer'});
 expect(updateCardSchema.parse({card_id:'existing',answer:'answer',language:'bg'}).language).toBe('bg');
});
