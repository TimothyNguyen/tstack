import { test, expect } from '@playwright/test';

test('devtools smoke page buttons respond and console stays clean', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.setContent(`
    <main>
      <h1>Subagent Devtools Smoke</h1>
      <button id="deploy">Deploy</button>
      <button id="inspect">Inspect</button>
      <output id="status">idle</output>
      <script>
        document.querySelector('#deploy').addEventListener('click', () => {
          document.querySelector('#status').textContent = 'deployed';
        });
        document.querySelector('#inspect').addEventListener('click', () => {
          document.querySelector('#status').textContent = 'inspected';
        });
      </script>
    </main>
  `);

  await page.getByRole('button', { name: 'Deploy' }).click();
  await expect(page.locator('#status')).toHaveText('deployed');

  await page.getByRole('button', { name: 'Inspect' }).click();
  await expect(page.locator('#status')).toHaveText('inspected');

  expect(consoleErrors).toEqual([]);
});
