import { test, expect } from '@playwright/test';

test('owners manage collaborators and collaborator controls respect permissions in both themes', async ({ page, browser }) => {
  const suffix = Date.now();
  const editorName = 'Editor-' + suffix;
  const editorContext = await browser.newContext();
  const editor = await editorContext.newPage();
  for (const [tab, username] of [[page, 'Owner-' + suffix], [editor, editorName]] as const) {
    await tab.goto('/');
    await tab.getByLabel('Username', { exact: true }).fill(username);
    await tab.getByLabel('Access code').fill('v3-e2e');
    await tab.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(tab.getByText('Deck library', { exact: true })).toBeVisible();
  }
  const response = await page.request.post('/api/deck', { headers: { Origin: new URL(page.url()).origin }, data: { title: 'Collaborator UI ' + suffix, visibility: 'PRIVATE', primaryLanguage: 'en', supportedLanguages: ['en'] } });
  expect(response.ok()).toBeTruthy();
  const { id } = await response.json();
  await page.reload();
  await page.getByRole('button', { name: 'Edit deck', exact: true }).last().click();
  const section = page.getByRole('group', { name: 'Collaborators', exact: true });
  await section.getByLabel('Username', { exact: true }).fill(editorName);
  await section.getByRole('button', { name: 'Add collaborator', exact: true }).click();
  await expect(section.getByText(editorName, { exact: true })).toBeVisible();
  await editor.reload();
  await editor.getByRole('button', { name: 'View deck', exact: true }).last().click();
  await expect(editor.getByRole('button', { name: 'Add card', exact: true })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Delete deck', exact: true })).not.toBeVisible();
  await editor.getByRole('button', { name: 'Edit deck', exact: true }).click();
  await expect(editor.locator('textarea[readonly]')).toHaveAttribute('readonly', '');
  await expect(editor.getByRole('button', {name:'Restore default',exact:true})).toBeDisabled();
  await expect(editor.getByRole('combobox', { name: 'Visibility', exact: true })).toBeDisabled();
  await expect(editor.getByRole('group', { name: 'Collaborators', exact: true })).toHaveCount(0);
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await expect(section.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  }
  await section.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(section.getByText(editorName, { exact: true })).toHaveCount(0);
  const denied = await editor.request.post('/api/card', { headers: { Origin: new URL(editor.url()).origin }, data: { deck: id, method: 'save', question: 'Denied?', answer: 'Denied' } });
  expect(denied.status()).toBe(404);
  await editorContext.close();
});

