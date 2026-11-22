import { test, expect } from '@playwright/test';

test('mixed decks preserve global preference, fall back for missing card translations and update setup union', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('Languages-' + Date.now());
  await page.getByLabel('Access code').fill('v3-e2e');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Deck library', { exact: true })).toBeVisible();
  const origin = new URL(page.url()).origin;
  const post = async (path: string, data: object) => {
    const response = await page.request.post('/api/' + path, { headers: { Origin: origin }, data });
    expect(response.ok(), await response.text()).toBeTruthy();
    return response.json();
  };
  const make = async (title: string, primaryLanguage: string, supportedLanguages: string[], cards: object[]) => {
    const { id } = await post('deck', { title, visibility: 'PRIVATE', primaryLanguage, supportedLanguages });
    for (const translations of cards) await post('card', { deck: id, method: 'save', translations });
    return id as string;
  };
  const a = await make('Language A', 'en', ['en', 'bg', 'de'], [{ en: { question: 'English original?', answer: 'English answer.' } }]);
  await make('Language B', 'bg', ['bg', 'de'], [
    { bg: { question: 'Bulgarian original one?', answer: 'Bulgarian answer one.' }, de: { question: 'Deutsche Frage?', answer: 'Deutsche Antwort.' } },
    { bg: { question: 'Bulgarian original two?', answer: 'Bulgarian answer two.' } },
  ]);
  await make('Language C', 'fr', ['fr'], [{ fr: { question: 'Question francaise?', answer: 'Reponse.' } }]);
  await page.reload();
  await page.getByRole('checkbox', { name: 'Language A', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Language B', exact: true }).check();
  const setup = page.getByRole('group', { name: 'Study language', exact: true });
  await expect(setup.getByRole('button')).toHaveText(['EN', 'BG', 'DE']);
  await setup.getByRole('button', { name: 'DE', exact: true }).click();
  await page.getByRole('button', { name: 'Start studying', exact: true }).click();
  const stage = page.locator('.study-active');
  const global = stage.getByRole('group', { name: 'Study language', exact: true });
  await expect(global.getByRole('button')).toHaveCount(3);
  await expect(global.getByRole('button', { name: 'DE', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(stage.locator('.study-question')).toContainText('English original?');
  await expect(stage.getByRole('status')).toContainText('DE unavailable');
  await expect(stage.locator('.study-question')).toHaveAttribute('lang', 'en');
  const before = await (await page.request.get('/api/cards?deck=' + a)).json();
  await global.getByRole('button', { name: 'BG', exact: true }).click();
  await expect(global.getByRole('button', { name: 'BG', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await global.getByRole('button', { name: 'DE', exact: true }).click();
  await expect(global.getByRole('button', { name: 'DE', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await (await page.request.get('/api/cards?deck=' + a)).json()).toEqual(before);
  const next = stage.locator('.study-navigation').getByRole('button', { name: 'Next', exact: true });
  await next.click();
  await expect(stage.locator('.study-question')).toContainText('Deutsche Frage?');
  await expect(stage.locator('.study-question')).toHaveAttribute('lang', 'de');
  await next.click();
  await expect(stage.locator('.study-question')).toContainText('Bulgarian original two?');
  await expect(stage.locator('.study-question')).toHaveAttribute('lang', 'bg');
  await expect(stage.getByRole('status')).toContainText('DE unavailable');
  await expect(global.getByRole('button', { name: 'DE', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await stage.locator('.study-navigation').getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(stage.locator('.study-question')).toContainText('Deutsche Frage?');
  await stage.getByRole('button', { name: 'Pause / Exit', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Language A', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Language B', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Language C', exact: true }).check();
  await expect(setup.getByRole('button')).toHaveText(['FR']);
  await expect(setup.getByRole('button', { name: 'FR', exact: true })).toHaveAttribute('aria-pressed', 'true');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Start new session', exact: true }).click();
  await expect(stage.locator('.study-question')).toContainText('Question francaise?');
  await expect(global.getByRole('button')).toHaveCount(1);
  await expect(global.getByRole('button', { name: 'FR', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
