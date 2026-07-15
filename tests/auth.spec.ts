import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชันเข้าสู่ระบบ (Authentication)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. เปิดหน้าแรกสุดของระบบ
    await page.goto('https://smart-logistic-erp.netlify.app/');

    // 2. คลิกปุ่ม "สำหรับเจ้าหน้าที่" ที่เมนูด้านบนขวา เพื่อเข้าสู่หน้า Login
    await page.getByRole('link', { name: 'สำหรับเจ้าหน้าที่' }).click();

    // 3. ยืนยันว่าระบบนำทางมาที่หน้า login เรียบร้อยแล้วก่อนเริ่มรันเคส
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-001: ตรวจสอบการ login ด้วยข้อมูลที่ถูกต้อง', async ({ page }) => {
    // ใช้อักษรตัวพิมพ์ใหญ่ขึ้นต้นตามหน้าจอจริง
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1234');

    // คลิกปุ่ม "เข้าสู่ระบบ"
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // 1. เปลี่ยนการยืนยันหน้าเว็บให้ตรงกับหน้าจริง (staff.html)
    await expect(page).toHaveURL(/.*staff\.html/);

    // 2. ปรับเป็น 'link' ให้ตรงตามโครงสร้าง HTML จริงบนหน้าจอ
    await page.getByRole('link', { name: '← กลับหน้าผู้ใช้งาน' }).click();

    // 3. ยืนยันว่าระบบพาเปลี่ยนกลับมาที่หน้าแรกสำเร็จ
    await expect(page).toHaveURL('https://smart-logistic-erp.netlify.app/');
  });

  test('TC-002: ตรวจสอบ password ผิด (Pass) - แบบป็อปอัปเบราว์เซอร์', async ({ page }) => {
    // ดักฟังเหตุการณ์เมื่อบราวเซอร์เปิดหน้าต่าง Alert เด้งขึ้นมา
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      await dialog.accept(); // กดปุ่ม OK เพื่อปิดป็อปอัป
    });

    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1111');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  });

  test('TC-003: ไม่กรอก username (Pass)', async ({ page }) => {
    // ใช้หน้าต่าง Dialog ของเบราว์เซอร์ในการรับข้อความแจ้งเตือนสีแดงตอนเว้นว่างข้อมูล
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBeTruthy(); // ยืนยันว่ามีข้อความเตือนเด้งขึ้นมาจริง
      await dialog.accept(); // กดปุ่ม OK เพื่อปิดหน้าต่างแจ้งเตือน
    });

    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  });

  test('TC-004: ไม่กรอก password (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBeTruthy();
      await dialog.accept();
    });

    await page.getByPlaceholder('Username').fill('admin');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  });

  test('TC-005: ไม่กรอกข้อมูลทั้งสองช่อง (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBeTruthy();
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  });

  test('TC-006: ตรวจสอบการแสดงผลหน้า login (Pass)', async ({ page }) => {
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('TC-007: ตรวจสอบช่อง username (Pass)', async ({ page }) => {
    const usernameInput = page.getByPlaceholder('Username');
    await usernameInput.click();
    await usernameInput.fill('test_user');
    await expect(usernameInput).toHaveValue('test_user');
  });

  test('TC-008: ตรวจสอบการแสดงผล password แบบปกปิด (Pass)', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC-009: refresh หน้า (Pass)', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page).toHaveURL(/.*staff\.html/);

    // ลองรีเฟรชหน้าเว็บ สถานะล็อกอินและ URL หน้าจัดการต้องยังอยู่เหมือนเดิม
    await page.reload();
    await expect(page).toHaveURL(/.*staff\.html/);
  });

test('TC-010: ออกจากระบบ (Pass)', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page).toHaveURL(/.*staff\.html/);

    // กดปุ่มออกจากระบบ
    await page.getByRole('link', { name: 'ออกจากระบบ' }).click();

    // ยืนยันว่าเมื่อกดออกจากระบบสำเร็จ ระบบจะส่งกลับไปยังหน้า login.html จริง
    await expect(page).toHaveURL(/.*login\.html/);
  });
});