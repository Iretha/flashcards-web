import { expect, it, vi, afterEach } from 'vitest';
import { readTheme, saveTheme } from '../src/ui/theme';
afterEach(() => vi.unstubAllGlobals());
it('restores theme and persists both directions', () => {
  let saved = 'dark';
  const root = { dataset: {} as Record<string, string> };
  vi.stubGlobal('document', { documentElement: root });
  vi.stubGlobal('localStorage', { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; } });
  expect(readTheme()).toBe('dark');
  for (const theme of ['light', 'dark'] as const) {
    saveTheme(theme);
    expect(root.dataset.theme).toBe(theme);
    expect(readTheme()).toBe(theme);
  }
});

it('keeps separate preferences for each signed-in user', () => {
  const values = new Map<string, string>();
  vi.stubGlobal('document', { documentElement: { dataset: {} } });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  saveTheme('light', 'alice');
  saveTheme('dark', 'bob');
  expect(readTheme('alice')).toBe('light');
  expect(readTheme('bob')).toBe('dark');
  saveTheme('dark', 'alice');
  expect(readTheme('alice')).toBe('dark');
});
