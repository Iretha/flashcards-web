import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handle } from '../../server/api';

export const prerender = false;
const bindings = env as unknown as { DB: D1Database; ACCESS_CODE?: string };
export const ALL: APIRoute = ({ request }) => handle(request, bindings.DB, bindings.ACCESS_CODE);
