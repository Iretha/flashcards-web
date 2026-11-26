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
  const options: RequestInit = { credentials: 'same-origin' };
  if (body !== undefined) {
    options.method = 'POST';
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const response = await fetch('/api/' + path, options);
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(response.status, `Unexpected response from /api/${path} (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result ? result.error : undefined;
    throw new ApiError(response.status, typeof message === 'string' ? message : 'The request failed.');
  }
  return result as T;
}

export async function signIn(username: FormDataEntryValue | null, code: FormDataEntryValue | null) {
  await api('login', { username, code });
  try {
    return await api<Home>('home');
  } catch (problem) {
    if (problem instanceof ApiError && problem.status === 401) {
      throw new ApiError(401, 'Login succeeded, but the session could not be verified. Check that cookies are enabled for this site and try again.');
    }
    throw problem;
  }
}

export const configureStudy = (input: { id: string; version: number; filters: import('../lib/classification').ClassificationFilters; sorting: import('../lib/classification').ClassificationSort }) => api<Session>('study/configure', input);
export const restartStudy = (session: Pick<Session, 'id' | 'version'>) => api<Session>('study/restart', { id: session.id, version: session.version });
