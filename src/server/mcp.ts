import { registerMcpWrites } from './mcp-writes';
import { registerMcpReads, cursorKey } from './mcp-reads';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { digest } from './auth';
import { budget } from './auth-common';
import { HttpError } from './http';

export interface McpConfig { PERSONAL_MCP_URLS_ENABLED?: string }
// Explicit opt-in applies equally to production and development.
export const personalMcpEnabled = (c: McpConfig) => c.PERSONAL_MCP_URLS_ENABLED === 'true';
export async function mcp(request: Request, database: D1Database, config: McpConfig) {
  const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };
  const fail = (status: number) => new Response('MCP request rejected.', { status, headers });
  if (!personalMcpEnabled(config)) return fail(404);
  const url = new URL(request.url);
  if (url.protocol !== 'https:') return fail(400);
  if (request.headers.has('Origin') && request.headers.get('Origin') !== url.origin) return fail(403);
  const secret = /^\/mcp\/(mcp_[a-f0-9]{64})$/.exec(url.pathname)?.[1];
  if (!secret || url.search) return fail(401);
  const db = (database.withSession ? database.withSession('first-primary') : database) as D1Database;
  try {
    const identity = await db.prepare("SELECT user_id FROM api_tokens WHERE purpose = 'mcp' AND token_hash = ? AND revoked_at IS NULL AND expires_at > ?")
      .bind(await digest(secret), Date.now()).first<{ user_id: string }>();
    if (!identity) return fail(401);
    await budget(db, 'mcp:' + identity.user_id, 120, 60000);
    if (request.method !== 'POST') return fail(405);
    // Bound the stream itself; Content-Length is not trusted.
    const reader = request.body?.getReader();
    if (!reader) return fail(400);
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const part = await reader.read(); if (part.done) break;
      length += part.value.length;
      if (length > 16384) { await reader.cancel(); return fail(413); }
      chunks.push(part.value);
    }
    const body = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    const server = new McpServer({ name: 'planerox-poc', version: '0.1.0' });
    registerMcpReads(server, db, identity.user_id, await cursorKey(secret));
    registerMcpWrites(server, db, identity.user_id);
    server.registerTool('ping', { description: 'Check Planerox MCP connectivity', inputSchema: {}, annotations: { readOnlyHint: true } }, async () => ({ content: [{ type: 'text', text: 'Planerox MCP connected' }] }));
    await server.connect(transport);
    try {
      const response = await transport.handleRequest(new Request(request, { body }));
      // Buffer before close: this PoC has bounded JSON responses, no SSE session.
      const output = await response.arrayBuffer();
      const resultHeaders = new Headers(response.headers);
      Object.entries(headers).forEach(([key, value]) => resultHeaders.set(key, value));
      return new Response(output.byteLength ? output : null, { status: response.status, headers: resultHeaders });
    } finally { await server.close(); }
  } catch (error) { return fail(error instanceof HttpError ? error.status : 400); }
}
