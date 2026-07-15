// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
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

    ignoreHTTPSErrors: true,

    /* 🛠️ เพิ่มจุดที่ 1: ใส่ launchOptions ตรงนี้เพื่อให้มีผลครอบคลุมกับทุกโปรเจกต์ */
    launchOptions: {
      args: [
        '--disable-features=Translate', // ปิด Google Translate Pop-up ถาวร
        '--lang=th-TH'                  // บังคับเบราว์เซอร์เปิดด้วยภาษาไทย
      ]
    }
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