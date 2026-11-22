export type Theme = 'dark' | 'light';
const themeKey = (username?: string) => username
  ? `flashcards-web:theme:user:${encodeURIComponent(username)}`
  : 'flashcards-web:theme';
export function readTheme(username?: string): Theme {
  try {
    const saved = localStorage.getItem(themeKey(username));
    if (saved === 'light' || saved === 'dark') return saved;
    return username ? readTheme() : 'dark';
  } catch { return 'dark'; }
}
export function saveTheme(theme: Theme, username?: string) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(themeKey(username), theme);
    // Used before authentication resolves to avoid a flash on the next visit.
    localStorage.setItem(themeKey(), theme);
  } catch { /* Storage is optional. */ }
}
