import { afterEach, describe, expect, it, vi } from 'vitest';
import { signIn } from '../src/ui/api';

afterEach(() => vi.unstubAllGlobals());

describe('Browser sign-in requests', () => {
  it('verifies the session with a same-origin request after login succeeds', async () => {
    const home = { username: 'Owner', decks: [], session: null };
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json({ username: 'Owner' }))
      .mockResolvedValueOnce(Response.json(home));
    vi.stubGlobal('fetch', fetch);

    await expect(signIn('Owner', 'test-fixture')).resolves.toEqual(home);
    expect(fetch).toHaveBeenNthCalledWith(1, '/api/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Owner', code: 'test-fixture' }),
    });
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/home', { credentials: 'same-origin' });
  });

  it.each([
    [401, 'Incorrect access code.'],
    [403, 'Cross-origin request rejected.'],
    [503, 'The server access code is not configured.'],
  ])('preserves a login HTTP %i error and skips home', async (status, message) => {
    const fetch = vi.fn().mockResolvedValueOnce(Response.json({ error: message }, { status }));
    vi.stubGlobal('fetch', fetch);

    await expect(signIn('Owner', 'test-fixture')).rejects.toMatchObject({ status, message });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('explains that session verification failed after a successful login', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json({ username: 'Owner' }))
      .mockResolvedValueOnce(Response.json({ error: 'Sign in to continue.' }, { status: 401 }));
    vi.stubGlobal('fetch', fetch);

    await expect(signIn('Owner', 'test-fixture')).rejects.toMatchObject({
      status: 401,
      message: expect.stringContaining('Login succeeded, but the session could not be verified.'),
    });
  });

  it('keeps the HTTP status and endpoint when an upstream response is not JSON', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('<h1>Unavailable</h1>', { status: 503 }));
    vi.stubGlobal('fetch', fetch);

    await expect(signIn('Owner', 'test-fixture')).rejects.toMatchObject({
      status: 503, message: 'Unexpected response from /api/login (HTTP 503).',
    });
  });
});
