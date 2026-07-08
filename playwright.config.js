// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({

  testDir: './tests',

  timeout: 60000,

  retries: 2,

  workers: 1,

  reporter: [
    ['list'],
    ['html']
  ],

  use: {

    baseURL: 'https://smart-logistic-erp.netlify.app/',

    headless: false,

    navigationTimeout: 60000,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'on-first-retry',

    viewport: { width: 1280, height: 720 },

    ignoreHTTPSErrors: true
  },

  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      }
    }
  ]
});