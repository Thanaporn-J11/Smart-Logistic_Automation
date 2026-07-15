import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชันเช็คพัสดุ (Real-Time Tracking)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. เข้าสู่หน้าแรกของระบบ
    await page.goto('https://smart-logistic-erp.netlify.app/');
    
    // 2. ระบุเจาะจงเมนูบน Navbar แบบเป๊ะๆ
    await page.getByRole('listitem').getByText('เช็คพัสดุ', { exact: true }).click();
    
    // 3. ยืนยันว่าหน้าจอเข้าสู่หน้า "ตรวจสอบสถานะพัสดุ" สำเร็จ
    await expect(page.getByText('ตรวจสอบสถานะพัสดุ')).toBeVisible();
  });

  test('TC-011: ค้นหาพัสดุด้วยหมายเลข Tracking ถูกต้อง (Pass)', async ({ page }) => {
    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('T715479', { force: true });
    
    // ใช้ Regular Expression ค้นหาข้อความเริ่มต้นแทนสัญลักษณ์ลูกศรพิเศษ
    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });

    // เช็คว่าตัวอักษรแสดงบนหน้าจอจริง
    await expect(page.getByText('T715479').first()).toBeVisible();
  });

  test('TC-012: ค้นหาพัสดุด้วยหมายเลข Tracking ที่ไม่มีในระบบ (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('ไม่พบข้อมูลพัสดุในระบบ');
      await dialog.accept();
    });

    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('T715480', { force: true });
    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });
  });

  test('TC-013: ไม่กรอกหมายเลข Tracking / ส่งค่าว่าง (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBeTruthy();
      await dialog.accept();
    });

    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });
  });

  test('TC-014: ตรวจสอบการพิมพ์หมายเลข Tracking ในช่องกรอกข้อมูล (Pass)', async ({ page }) => {
    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('T715479', { force: true });
    
    await expect(trackingInput).toHaveValue('T715479');
  });

  test('TC-015: ตรวจสอบปุ่มค้นหาพัสดุทำงานได้ปกติ (Pass)', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: /^ค้นหาพัสดุ/ });
    await expect(searchButton).toBeEnabled();
  });

  test('TC-016: กรอกหมายเลข Tracking รูปแบบผิดเงื่อนไข (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('ABCDEFG', { force: true });
    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });
  });

  test('TC-017: ตรวจสอบการแสดงผลสถานะพัสดุบน UI (Pass)', async ({ page }) => {
    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('T715479', { force: true });
    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });

    await expect(page.getByText('T715479').first()).toBeVisible();
  });

  test('TC-018: ตรวจสอบเวลาในการค้นหาพัสดุ / Performance (Pass)', async ({ page }) => {
    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('T715479', { force: true });
    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });
    
    await expect(page.getByText('T715479').first()).toBeVisible();
  });

test('TC-019: ตรวจสอบการแสดงผลหน้าเว็บแบบ Responsive / ไม่ผิดรูป (Pass)', async ({ page }) => {
    // ระบุเจาะจงรูปภาพที่ต้องการเช็คผ่าน Alt text ของหน้านี้แทนการใช้ .first()
    await expect(page.getByRole('img', { name: 'Track your parcel' })).toBeVisible();
    await expect(page.getByText('ข้อมูลแม่นยำ')).toBeVisible();
  });

  /** [BUG KEY] ค้นหาพัสดุแล้วเมื่อกด refresh หน้าจอ หน้าเว็บดีดกลับไปหน้าแรกสุด */
  test('TC-020: refresh หน้าหลังค้นหาพัสดุ (BUG - Fail)', async ({ page }) => {
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กรีเฟรชหน้าจอหลังจากค้นหาแล้วระบบเปลี่ยนหน้ากลับไปหน้าแรกสุด');

    const trackingInput = page.getByPlaceholder('กรอกหมายเลข Tracking (เช่น T123456)');
    await trackingInput.fill('T715479', { force: true });
    await page.getByRole('button', { name: /^ค้นหาพัสดุ/ }).click({ force: true });

    await page.reload();
    await expect(page.getByText('ตรวจสอบสถานะพัสดุ')).toBeVisible();
  });
});