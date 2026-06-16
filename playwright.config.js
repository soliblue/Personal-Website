const { defineConfig, devices } = require('@playwright/test');

const port = process.env.E2E_PORT || 8082;
const baseURL = `http://127.0.0.1:${port}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 7 * 1000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `HOST=127.0.0.1 PORT=${port} npm run dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
