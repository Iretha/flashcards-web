import { defineConfig } from '@playwright/test';

// Each run owns disposable storage; auth rate limits must not leak between runs.
const persistence = `.wrangler/v4-e2e-${Date.now()}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.ts',
  workers: 1,
  use: { baseURL: 'http://localhost:4322', channel: 'msedge', headless: true },
  webServer: {
    command: `npx wrangler d1 migrations apply DB --local --persist-to ${persistence} && npm run build && npx wrangler dev --local --port 4322 --persist-to ${persistence} --var ACCESS_CODE:v3-e2e --var AUTH_QR_ENABLED:true`,
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
