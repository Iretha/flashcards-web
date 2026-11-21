export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function check(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new HttpError(status, message);
}

export function string(value: unknown, label: string, max: number, optional = false) {
  check(typeof value === 'string' && value.length <= max && (optional || value.trim()), 'Invalid ' + label + '.');
  return value.trim();
}

export function object(value: unknown): Record<string, unknown> {
  check(value && typeof value === 'object' && !Array.isArray(value), 'Expected an object.');
  return value as Record<string, unknown>;
}

export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}
