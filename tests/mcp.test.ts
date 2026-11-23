import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { describe, it, expect, vi } from 'vitest';
import { mcp } from '../src/server/mcp';
import { authenticateClient } from '../src/server/auth';
const secret = 'mcp_' + 'a'.repeat(64);
const config = { PERSONAL_MCP_URLS_ENABLED: 'true' };
function database(valid = true) {
  return { prepare: (sql: string) => ({ bind: () => ({ first: async () => sql.includes('RETURNING count') ? 1 : sql.includes("purpose = 'management'") ? null : valid ? { user_id: 'synthetic' } : null }) }) } as unknown as D1Database;
}
const request = (method: string, params: unknown = {}, credential = secret) => new Request('https://example.test/mcp/' + credential, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
describe('personal MCP protocol', () => {
  it('initializes, discovers and invokes ping without a persistent session', async () => {
    const init = await mcp(request('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '1' } }), database(), config);
    expect(init.status).toBe(200); expect((await init.json() as { result: { serverInfo: { name: string } } }).result.serverInfo.name).toBe('planerox-poc');
    const list = await mcp(request('tools/list'), database(), config);
    expect((await list.json() as { result: { tools: { name: string }[] } }).result.tools.map((t: { name: string }) => t.name)).toEqual(['list_decks', 'get_deck', 'search_cards', 'get_card', 'create_card', 'ping']);
    const ping = await mcp(request('tools/call', { name: 'ping', arguments: {} }), database(), config);
    expect((await ping.json() as { result: { content: { text: string }[] } }).result.content[0].text).toBe('Planerox MCP connected');
  });
  it.each(['', 'invalid', 'fc_' + 'a'.repeat(64)])('rejects missing, invalid and management credentials', async value => {
    expect((await mcp(request('tools/list', {}, value), database(), config)).status).toBe(401);
  });
  it.each(['revoked', 'expired', 'unknown'])('rejects %s database credentials without disclosure', async () => {
    const log = vi.spyOn(console, 'error');
    const response = await mcp(request('tools/list'), database(false), config);
    expect(response.status).toBe(401); expect(await response.text()).not.toContain(secret); expect(log).not.toHaveBeenCalled(); log.mockRestore();
  });
  it('rejects MCP credentials at Management API', async () => {
    expect(await authenticateClient(database(), new Request('https://example.test', { headers: { Authorization: 'Bearer ' + secret } }))).toBeNull();
  });
  it('is disabled without an explicit true flag', async () => {
    for (const c of [{}, { ...config, PERSONAL_MCP_URLS_ENABLED: 'false' }]) expect((await mcp(request('tools/list'), database(), c)).status).toBe(404);
  });
});

it('connects using the official SDK client', async () => {
 const client = new Client({ name: 'verification', version: '1' });
 const transport = new StreamableHTTPClientTransport(new URL('https://example.test/mcp/' + secret), {
 fetch: async (input, init) => mcp(new Request(input, init), database(), config)
 });
 await client.connect(transport);
 expect((await client.listTools()).tools.map(t => t.name)).toEqual(['list_decks', 'get_deck', 'search_cards', 'get_card', 'create_card', 'ping']);
 const result = await client.callTool({ name: 'ping', arguments: {} });
 expect(result.content).toEqual([{ type: 'text', text: 'Planerox MCP connected' }]);
 await client.close();
});

it('keeps bearer paths out of failures and disables caching/referrers', async () => {
  const broken = { prepare: () => { throw new Error('database failure containing ' + secret); } } as unknown as D1Database;
  const log = vi.spyOn(console, 'error');
  try {
    for (const db of [database(false), broken]) {
      const response = await mcp(request('tools/list'), db, config);
      expect([400, 401]).toContain(response.status);
      expect(await response.text()).toBe('MCP request rejected.');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    }
    expect(log).not.toHaveBeenCalled();
  } finally { log.mockRestore(); }
});
it('rejects insecure transport, foreign origins and query credentials', async () => {
  const original = request('tools/list');
  expect((await mcp(new Request(original.url.replace('https:', 'http:'), original), database(), config)).status).toBe(400);
  const foreign = request('tools/list'); foreign.headers.set('Origin', 'https://foreign.test');
  expect((await mcp(foreign, database(), config)).status).toBe(403);
  expect((await mcp(new Request(original.url + '?secret=ignored', request('tools/list')), database(), config)).status).toBe(401);
});
