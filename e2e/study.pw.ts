import { test, expect } from '@playwright/test';
import { v5Fixture } from '../tests/fixtures/v5';

test('previews v5 type transitions and clears, reimports and confirms destructive replacement', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('V5-preview-' + Date.now());
  await page.getByLabel('Access code').fill('v3-e2e');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Import Markdown', exact: true }).click();
  const upload = async (source: string) => {
    await page.getByLabel('Markdown files').setInputFiles({ name: 'v5.md', mimeType: 'text/markdown', buffer: Buffer.from(source) });
    await page.getByRole('button', { name: 'Preview import', exact: true }).click();
    await expect(page.getByText('0 invalid', { exact: false })).toBeVisible();
  };
  await upload(v5Fixture);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
  await upload('---\nformatVersion: 5\ndeckId: v3-test\ntitle: V3 mixed deck\nprimaryLanguage: en\n---\n## card: task\n### cardType: question\n### topics\n[]\n### provenance\nnull\n### answerReferences\n[]\n### en\n#### question\nImplement a counter.\n#### questionDetails\n#### answer');
  const change = page.locator('details').filter({ has: page.locator('summary', { hasText: 'classification, type and metadata changes' }) }).first();
  await expect(change.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Card type', exact: true }) })).toContainText('taskquestion');
  await expect(change.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Topics', exact: true }) })).toContainText('No topics');
  await page.getByLabel('Resolution').selectOption('update');
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
  await page.getByLabel('Markdown files').setInputFiles({ name: 'v5.md', mimeType: 'text/markdown', buffer: Buffer.from(v5Fixture) });
  await page.getByLabel('Target deck').selectOption({ label: 'V3 mixed deck' });
  await page.getByLabel('Replace all cards (re-import)').check();
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('delete all 2 existing cards');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Replace all cards', exact: true }).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
});

test('imports v5 in the browser and studies with keyboard, history, repeats and responsive controls', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('E2E-' + Date.now());
  await page.getByLabel('Access code').fill('v3-e2e');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Import Markdown', exact: true }).click();
  await page.getByLabel('Markdown files').setInputFiles({ name: 'v3.md', mimeType: 'text/markdown', buffer: Buffer.from(v5Fixture) });
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(page.getByText('0 invalid', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  await page.getByRole('button', { name: 'View deck', exact: true }).click();
  await expect(page.locator('article.item')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Card type', exact: true }).selectOption('task');
  await expect(page.locator('article.item')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Company', exact: true }).selectOption('Example');
  await page.getByRole('combobox', { name: 'Provenance', exact: true }).selectOption('mixed');
  await page.getByRole('combobox', { name: 'Topic', exact: true }).selectOption('JAVA');
  await expect(page.locator('article.item')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Card type', exact: true }).selectOption('question');
  await expect(page.getByText('No cards match these filters.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  await page.getByRole('checkbox', { name: /V3 mixed deck/ }).check();
  await page.getByRole('checkbox', { name: 'Enable timer' }).uncheck();
  await page.getByRole('button', { name: 'Start studying', exact: true }).click();
  const stage = page.locator('.study-active');
  await expect(stage.getByText('Implement a counter.', { exact: true })).toBeVisible();
  const answer = stage.locator('.answer-panel');
  await expect(answer).toHaveJSProperty('open', false);
  for (const name of ['Learned', 'Explain Simply', 'Detailed Explanation', 'More Details', 'Example']) {
    await expect(stage.getByRole('button', { name, exact: true })).toHaveCount(0);
  }
  await stage.locator('.card-sources summary').click();
  await expect(stage.locator('.question-details')).toContainText('int count = 0;');
  await expect(stage.locator('.question-details .token.keyword')).toContainText('int');
  await expect(stage.getByRole('link', { name: 'Interview account' })).toHaveAttribute('href', 'https://example.com/interview');
  const repeat = stage.getByRole('switch', { name: 'Repeat', exact: true });
  const studyActions = stage.locator('.study-navigation');
  await repeat.focus(); await page.keyboard.press('Space');
  await expect(repeat).toBeChecked();
  await expect(stage.getByText('Implement a counter.', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Resume session', exact: true }).click();
  await expect(repeat).toBeChecked();
  await stage.focus(); await page.keyboard.press('l');
  await expect(stage.getByText('Implement a counter.', { exact: true })).toBeVisible();
  await page.keyboard.press('r'); await expect(repeat).not.toBeChecked();
  await page.keyboard.press('r'); await expect(repeat).toBeChecked();
  await stage.focus(); await page.keyboard.press('Enter');
  await expect(answer).toHaveJSProperty('open', true);
  await expect(stage.locator('.answer')).toContainText('Use AtomicInteger.');
  await answer.locator(':scope > summary').click();
  await expect(answer).toHaveJSProperty('open', false);
  await stage.focus(); await page.keyboard.press('ArrowRight');
  await expect(stage.getByText('What is atomicity?', { exact: true })).toBeVisible();
  await stage.getByRole('button', { name: 'Prev', exact: true }).click();
  await expect(repeat).toBeChecked();
  await studyActions.getByRole('button', { name: 'Next', exact: true }).click();
  await studyActions.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(stage.getByText('Implement a counter.', { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  const controls = await stage.locator('.actions').evaluate(element => [...element.children].map(child => child.getBoundingClientRect().top));
  expect(Math.max(...controls) - Math.min(...controls)).toBeLessThan(20);
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(repeat).toBeVisible();
  }
  await repeat.click();
  await expect(repeat).not.toBeChecked();
  await studyActions.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Session complete', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  await page.getByRole('button', { name: 'View deck', exact: true }).click();
  await page.getByRole('button', { name: 'Add card', exact: true }).click();
  const editor = page.locator('form.item');
  await editor.getByRole('combobox', { name: 'Card Type', exact: true }).selectOption('task');
  const topicsInput = editor.getByRole('textbox', { name: 'Topics (one per line)', exact: true });
  const rawTopics = Array(250).fill('  java  ').concat('Concurrency').join('\n');
  await topicsInput.focus();
  await page.keyboard.insertText(rawTopics);
  await expect(topicsInput).toHaveValue(rawTopics);
  await editor.getByRole('textbox', { name: 'Question', exact: true }).fill('Implement a sum.');
  await editor.getByRole('textbox', { name: 'Answer', exact: true }).fill('return a + b;');
  await expect(editor.getByRole('button', { name: 'Save card' })).toBeDisabled();
  await editor.getByRole('textbox', { name: 'Task Specification', exact: true }).fill('Implement sum(int a, int b).');
  await editor.getByRole('button', { name: 'Save card' }).click();
  const sum = page.locator('article.item').filter({ has: page.getByRole('heading', { name: 'Implement a sum.', exact: true }) });
  await expect(sum.locator('summary').first()).toContainText('CONCURRENCY, JAVA');
  await sum.getByRole('button', { name: 'Edit card' }).click();
  await topicsInput.fill('ß'.repeat(101));
  await editor.getByRole('button', { name: 'Save card' }).click();
  await expect(page.getByRole('alert')).toContainText('exceeds 200 UTF-16 code units');
  await expect(sum.locator('summary').first()).toContainText('CONCURRENCY, JAVA');
  await editor.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('combobox', { name: 'Card type', exact: true }).selectOption('task');
  await page.getByRole('combobox', { name: 'Provenance', exact: true }).selectOption('generated');
  await expect(page.locator('article.item')).toHaveCount(1);
});


test('studies an answerless imported card with a visual placeholder and AI links', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('Answerless-' + Date.now());
  await page.getByLabel('Access code').fill('v3-e2e');
  await page.getByRole('button', {name:'Sign in', exact:true}).click();
  await page.getByRole('button', {name:'Import Markdown', exact:true}).click();
  const source = '---\nformatVersion: 5\ntitle: Answerless study\nprimaryLanguage: en\n---\n## card: empty\n### cardType: question\n### topics\n- Java\n### provenance\ntype: generated\nsources: []\n### en\n#### question\nWhat is happens-before?';
  await page.getByLabel('Markdown files').setInputFiles({name:'empty.md',mimeType:'text/markdown',buffer:Buffer.from(source)});
  await page.getByRole('button', {name:'Preview import',exact:true}).click();
  await expect(page.getByText('0 invalid',{exact:false})).toBeVisible();
  await page.getByRole('button', {name:'Apply import',exact:true}).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
  await page.getByRole('button', {name:'Back to library',exact:true}).click();
  await page.getByRole('checkbox',{name:/Answerless study/}).check();
  await page.getByRole('checkbox',{name:'Enable timer'}).uncheck();
  await page.getByRole('button',{name:'Start studying',exact:true}).click();
  const panel = page.locator('.answer-panel');
  await expect(panel).toHaveJSProperty('open',false);
  await panel.locator('summary').click();
  await expect(panel).toHaveJSProperty('open',true);
  await expect(page.locator('#study-answer')).toHaveText('\u2014');
  const link = panel.getByRole('link',{name:'Ask ChatGPT about this question'});
  await expect(link).toBeVisible();
  expect(decodeURIComponent((await link.getAttribute('href'))!)).toContain('What is happens-before?');
  await panel.locator('summary').click();
  await expect(panel).toHaveJSProperty('open',false);
});

test('keeps Study filters and sorting in a draft and restarts completed settings', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('Filters-' + Date.now());
  await page.getByLabel('Access code').fill('v3-e2e');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Import Markdown', exact: true }).click();
  const source = v5Fixture.replace('- Java\n### provenance\ntype: generated', '[]\n### provenance\ntype: generated');
  await page.getByLabel('Markdown files').setInputFiles({ name: 'filters.md', mimeType: 'text/markdown', buffer: Buffer.from(source) });
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.getByText('Imported successfully.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to library', exact: true }).click();
  const panel = page.locator('.study-classification');
  await expect(panel).toHaveCount(0);
  await page.getByRole('checkbox', { name: /V3 mixed deck/ }).check();
  await page.getByRole('checkbox', { name: 'Enable timer' }).uncheck();
  await page.getByRole('button', { name: 'Start studying', exact: true }).click();
  await panel.getByText('Filters and sorting', { exact: true }).click();
  const topics = panel.locator('summary').filter({ hasText: /All topics|No Topics/ });
  await topics.click();
  const noTopics = panel.getByRole('checkbox', { name: 'No Topics', exact: true });
  await noTopics.check();
  await noTopics.press('r');
  await expect(page.getByRole('switch', { name: 'Repeat' })).not.toBeChecked();
  await noTopics.press('Escape');
  await expect(topics).toBeFocused();
  await expect(noTopics).toBeHidden();
  await panel.getByLabel('Sort by').selectOption('priority');
  await panel.getByLabel('Direction').selectOption('desc');
  await expect(panel.getByRole('status')).toHaveText('Applied: 2 of 2 cards');
  await panel.getByRole('button', { name: 'Cancel changes' }).click();
  await expect(panel.getByLabel('Sort by')).toHaveValue('default');
  await topics.click();
  await expect(noTopics).not.toBeChecked();
  await noTopics.check();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.route('**/api/study/configure', route => route.fulfill({
    status: 409, json: { error: 'The session changed on another device.' },
  }), { times: 1 });
  const apply = panel.getByRole('button', { name: 'Apply', exact: true });
  await apply.click();
  await expect(page.getByRole('alert')).toContainText('The session changed');
  await expect(apply).toBeEnabled();
  await expect(noTopics).toBeChecked();
  await expect(panel.getByRole('status')).toHaveText('Applied: 2 of 2 cards');
  await apply.click();
  await expect(panel.getByRole('status')).toHaveText('Applied: 1 of 2 cards');
  await expect(page.getByText('What is atomicity?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Apply', exact: true })).toHaveCount(0);
  await panel.getByRole('button', { name: 'Restart Session' }).click();
  await expect(page.getByRole('heading', { name: 'Session complete' })).toHaveCount(0);
  await expect(panel.getByRole('status')).toHaveText('Applied: 1 of 2 cards');

  const current = await (await page.request.get('/api/study')).json();
  const configured = await page.request.post('/api/study/configure', {
    headers: { Origin: new URL(page.url()).origin },
    data: {
      id: current.id, version: current.version, sorting: current.applied.sorting,
      filters: { ...current.applied.filters, topics: { values: ['ARCHIVED', 'RETIRED'], includeNoTopics: true }, cardTypes: ['question'] },
    },
  });
  expect(configured.ok()).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: 'Resume session' }).click();
  await panel.getByText('Filters and sorting', { exact: true }).click();
  await panel.locator('summary').filter({ hasText: 'ARCHIVED' }).click();
  const remove = panel.getByRole('button', { name: 'Remove ARCHIVED', exact: true });
  await remove.press('Enter');
  await expect(remove).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Remove RETIRED', exact: true })).toBeVisible();
  await expect(noTopics).toBeChecked();
  expect((await (await page.request.get('/api/study')).json()).applied.filters.topics.values).toEqual(['ARCHIVED', 'RETIRED']);
  await apply.click();
  await expect.poll(async () => (await (await page.request.get('/api/study')).json()).applied.filters).toMatchObject({
    topics: { values: ['RETIRED'], includeNoTopics: true }, cardTypes: ['question'],
  });
});
