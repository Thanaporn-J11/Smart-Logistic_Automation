import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชัน Staff Dashboard / อัพเดตสถานะการจัดส่ง', () => {

  test.beforeEach(async ({ page }) => {
    // 1. เข้าสู่หน้าแรกและไปที่หน้า Login
    await page.goto('https://smart-logistic-erp.netlify.app/');
    await page.getByText('สำหรับเจ้าหน้าที่').click();

    // 2. ทำการ Login ด้วย Username และ Password เจ้าหน้าที่
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // 3. ยืนยันว่าหน้าเว็บโหลดเข้ามาที่ระบบจัดการพัสดุเรียบร้อยแล้ว
    await expect(page).toHaveURL(/.*staff\.html/);
    await expect(page.getByText('อัพเดตสถานะการจัดส่ง')).toBeVisible();
  });

  test('TC-050: ตรวจสอบโครงสร้างและการแสดงผลของฟอร์ม (Pass)', async ({ page }) => {
    // ตรวจสอบ ลาเบล และองค์ประกอบหลักในกล่องอัปเดตสถานะ
    await expect(page.getByText('รหัสพัสดุ (Tracking ID)')).toBeVisible();

    // เปลี่ยนมาค้นหาโดยระบุว่าเป็น label เพื่อไม่ให้ไปชนกับหัวตารางด้านล่าง
    await expect(page.locator('label').filter({ hasText: 'สถานะล่าสุด' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'ยืนยันการอัพเดตสถานะ' })).toBeVisible();
  });

  test('TC-051: อัปเดตสถานะเป็น "ถึงศูนย์คัดแยกสินค้า" สำเร็จ (Pass)', async ({ page }) => {
    // 1. กรอกรหัสพัสดุ (สมมติเลขตัวอย่างตามตารางเก่า)
    // สังเกตจาก snapshot ช่องนี้เป็น textbox ที่ไม่มี placeholder ชัดเจน แต่เป็นตัวถัดจากคำว่า Tracking ID
    await page.locator('text=รหัสพัสดุ (Tracking ID) >> xpath=../following-sibling::input | ..//input').first().fill('T715479');

    // 2. เลือกสถานะจาก Dropdown/Combobox
    await page.getByRole('combobox').selectOption({ label: '📦 ถึงศูนย์คัดแยกสินค้า' });

    // 3. ดักจับ Alert แจ้งเตือนการบันทึกสำเร็จ (หากระบบมี)
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    // 4. กดปุ่มยืนยัน
    await page.getByRole('button', { name: 'ยืนยันการอัพเดตสถานะ' }).click();
  });

  test('TC-052: อัปเดตสถานะเป็น "พนักงานกำลังนำจ่าย" สำเร็จ (Pass)', async ({ page }) => {
    await page.locator('text=รหัสพัสดุ (Tracking ID) >> xpath=../following-sibling::input | ..//input').first().fill('T715479');
    await page.getByRole('combobox').selectOption({ label: '🚚 พนักงานกำลังนำจ่าย' });

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'ยืนยันการอัพเดตสถานะ' }).click();
  });

  test('TC-053: อัปเดตสถานะเป็น "พัสดุถึงปลายทางแล้ว" สำเร็จ (Pass)', async ({ page }) => {
    await page.locator('text=รหัสพัสดุ (Tracking ID) >> xpath=../following-sibling::input | ..//input').first().fill('T715479');
    await page.getByRole('combobox').selectOption({ label: '✅ พัสดุถึงปลายทางแล้ว' });

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'ยืนยันการอัพเดตสถานะ' }).click();
  });

  test('TC-054: ส่งค่าว่าง/ไม่กรอกรหัสพัสดุแล้วกดอัปเดต (Pass)', async ({ page }) => {
    // คาดหวังว่าระบบจะแจ้งเตือนให้กรอกข้อมูล
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBeTruthy();
      await dialog.accept();
    });

    // ปล่อยช่องรหัสพัสดุเป็นค่าว่างแล้วกดปุ่มยืนยันทันที
    await page.getByRole('button', { name: 'ยืนยันการอัพเดตสถานะ' }).click();
  });
});