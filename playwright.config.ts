import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3011',
    headless: true,
    channel: 'chrome',
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: [
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3011',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
