import type { Card, inspectImport, listDecks } from '../server/decks';
import type { studyView } from '../server/sessions';
import type { Settings } from '../lib/study';

export type Deck = Awaited<ReturnType<typeof listDecks>>[number];
export type Session = NonNullable<Awaited<ReturnType<typeof studyView>>>;
export type Preview = Awaited<ReturnType<typeof inspectImport>>;
export type Home = { username: string; settings: Settings; decks: Deck[]; session: Session | null };
export type { Card };

export class ApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export async function api<T>(path: string, body?: object): Promise<T> {
  const response = await fetch('/api/' + path, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result ? result.error : undefined;
    throw new ApiError(response.status, typeof message === 'string' ? message : 'The request failed.');
  }
  return result as T;
}
