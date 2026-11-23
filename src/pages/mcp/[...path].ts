import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { mcp, type McpConfig } from '../../server/mcp';
export const prerender = false;
export const ALL: APIRoute = ({ request }) => {
  const bindings = env as unknown as McpConfig & { DB: D1Database };
  return mcp(request, bindings.DB, bindings);
};
