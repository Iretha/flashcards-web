import { test, expect } from '@playwright/test';

const source = `---
formatVersion: 4
deckId: converted-legacy
title: Converted legacy
primaryLanguage: en
supportedLanguages: [en]
---
## card: stable
### cardType: question
### topic: SQL; JDBC
### interviewPriority: 5
### provenance
type: generated
### en
#### question
What stays during conversion?
#### answer
Source content.
`;

test('legacy conversion requires review, download, v5 preview and explicit import', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('Conversion-' + Date.now());
  await page.getByLabel('Access code').fill('v3-e2e');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Import Markdown', exact: true }).click();
  let mutations = 0;
  page.on('request', request => { if (request.url().includes('/api/import/apply')) mutations++; });
  await page.getByLabel('Markdown files', { exact: true }).setInputFiles({ name: 'legacy.md', mimeType: 'text/markdown', buffer: Buffer.from(source) });
  await expect(page.getByText('Import requires Markdown v5.', { exact: false })).toBeVisible();
  await page.getByText('Convert legacy v3/v4 to v5', { exact: true }).click();
  await page.getByLabel('Legacy Markdown file').setInputFiles({ name: 'legacy.md', mimeType: 'text/markdown', buffer: Buffer.from(source) });
  await page.getByRole('button', { name: 'Convert to v5', exact: true }).click();
  await expect(page.getByText('Card stable — interviewPriority: omitted legacy value 5; priority defaults to 3.')).toBeVisible();
  const converted = await page.getByLabel('Converted v5 Markdown', { exact: true }).inputValue();
  expect(converted).toContain('formatVersion: 5');
  expect(mutations).toBe(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download converted v5', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('converted-v5.md');
  const reportDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download conversion report', exact: true }).click();
  expect((await reportDownload).suggestedFilename()).toBe('conversion-report.txt');
  await page.getByLabel('Markdown files', { exact: true }).setInputFiles({ name: 'converted-v5.md', mimeType: 'text/markdown', buffer: Buffer.from(converted) });
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(page.getByText('1 new cards', { exact: false })).toBeVisible();
  expect(mutations).toBe(0);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
  expect(mutations).toBe(1);
});
