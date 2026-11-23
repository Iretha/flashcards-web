import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.ts',
  workers: 1,
  use: { baseURL: 'http://localhost:4322', channel: 'msedge', headless: true },
  webServer: {
    command: 'npm run db:e2e && npm run build && npx wrangler dev --local --port 4322 --persist-to .wrangler/v3-e2e --var ACCESS_CODE:v3-e2e --var AUTH_QR_ENABLED:true',
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
