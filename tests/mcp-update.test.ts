import { expect, it } from 'vitest';
import { updateCardSchema, updateMcpCard } from '../src/server/mcp-writes';

it.each([
 {},
 {card_id:'a',answer:'x'.repeat(20001)}, {card_id:'a',answer:'a',question:'q'},
 {card_id:'a',answer:'a',translations:{}},
])('rejects invalid answer-only inputs before database access', async args => {
 await expect(updateMcpCard({} as D1Database,'owner',args)).rejects.toThrow('INVALID_ARGUMENTS');
});
it('accepts explicit and omitted languages', () => {
 expect(updateCardSchema.parse({card_id:'existing',answer:'answer'})).toEqual({card_id:'existing',answer:'answer'});
 expect(updateCardSchema.parse({card_id:'existing',answer:'answer',language:'bg'}).language).toBe('bg');
});

it.each([undefined,'',' '])('accepts answer omission/empty %s',answer=>{expect(updateCardSchema.safeParse({card_id:'a',...(answer===undefined?{}:{answer})}).success).toBe(true)});

it('requires a revision for classification updates before database access', async () => {
 await expect(updateMcpCard({} as D1Database, 'owner', {card_id:'a',topics:[]})).rejects.toThrow('INVALID_ARGUMENTS');
});
it('accepts canonical patches with a revision and rejects invalid ratings', () => {
 expect(updateCardSchema.safeParse({card_id:'a',expected_revision:1,priority:null,topics:[],metadata:null,creationMode:'UNKNOWN'}).success).toBe(true);
 expect(updateCardSchema.safeParse({card_id:'a',expected_revision:1,priority:6}).success).toBe(false);
});
