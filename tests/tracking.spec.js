import { test, expect } from '@playwright/test';

test('TC-005 ตรวจสอบหน้าเช็คพัสดุ', async ({ page }) => {

  await page.goto('https://smart-logistic-erp.netlify.app/', {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForLoadState('networkidle');

  await page.getByText('เช็คพัสดุ').click();

  await expect(
    page.getByText('เช็คพัสดุ')
  ).toBeVisible();

});