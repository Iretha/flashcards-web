import { expect, it } from 'vitest';
import { personalMcpEnabled } from '../src/server/mcp';
it('enables explicit opt-in in every deployment', () => expect(personalMcpEnabled({ PERSONAL_MCP_URLS_ENABLED: 'true' })).toBe(true));
it.each([undefined, 'false', 'TRUE', '', 'invalid', ' true ', '1'])('rejects flag %s', flag => {
 expect(personalMcpEnabled({ PERSONAL_MCP_URLS_ENABLED: flag })).toBe(false);
});
