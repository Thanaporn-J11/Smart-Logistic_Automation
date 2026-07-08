import { test, expect } from '@playwright/test';

test('TC-004 ไปหน้าเช็คราคาค่าจัดส่ง', async ({ page }) => {

  await page.goto('https://smart-logistic-erp.netlify.app/', {
    waitUntil: 'domcontentloaded'
  });

  // รอหน้าโหลด
  await page.waitForLoadState('networkidle');

  // คลิกเมนูเช็คราคา
  await page.getByRole('link', { name: /เช็ค.*ราคา/ }).click();

  // ตรวจสอบว่าเข้าหน้าเช็คราคาแล้ว
  await expect(page).toHaveURL(/price/);

});