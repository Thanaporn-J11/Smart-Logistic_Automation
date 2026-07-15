import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชัน Staff Dashboard / รายการพัสดุล่าสุด และ ปุ่มระบบ', () => {

  test.beforeEach(async ({ page }) => {
    // 1. เข้าสู่หน้าแรกและไปที่หน้า Login
    await page.goto('https://smart-logistic-erp.netlify.app/');
    await page.getByText('สำหรับเจ้าหน้าที่').click();

    // 2. ทำการ Login ด้วย Username และ Password เจ้าหน้าที่
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // 3. ยืนยันว่าหน้าเว็บโหลดเข้ามาที่ระบบจัดการพัสดุแล้วก่อนเริ่มรันเคส
    await expect(page).toHaveURL(/.*staff\.html/);
  });

  test('TC-055: หน้ารายการพัสดุล่าสุด - แสดงตารางพัสดุ (Pass)', async ({ page }) => {
    // ตรวจสอบว่ามีส่วนหัวข้อ "รายการพัสดุล่าสุดในระบบ" ปรากฏอยู่บนหน้าจอ
    await expect(page.getByText('รายการพัสดุล่าสุดในระบบ')).toBeVisible();

    // ระบุ Role เจาะจงไปที่หัวคอลัมน์ตาราง เพื่อไม่ให้ชนกับลาเบลช่องกรอกข้อมูลส่วนอื่น
    await expect(page.getByRole('columnheader', { name: 'เลขพัสดุ (Tracking)' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ผู้ส่ง' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ผู้รับ' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'สถานะล่าสุด' })).toBeVisible();
  });

  /** [BUG KEY] คลิกเลขพัสดุในตารางแล้วระบบไม่ตอบสนอง ไม่มีอะไรเกิดขึ้น */
  test('TC-056: หน้ารายการพัสดุล่าสุด - คลิก Tracking (BUG - Fail)', async ({ page }) => {
    // สั่งข้ามเคสนี้ชั่วคราวเนื่องจากพบบั๊กระบบไม่ยอมแสดงข้อมูลพัสดุเมื่อคลิกลิงก์ตามคู่มือแมนนวล
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กกดลิงก์เลขพัสดุในตารางแล้วไม่มีข้อมูลแสดงผลขึ้นมา');

    // ค้นหาลิงก์เลขพัสดุในหน้าจอ (อ้างอิงเลขพัสดุ T715479 ตามที่ระบุใน Manual)
    const trackingLink = page.getByText('T715479');
    await expect(trackingLink).toBeVisible();
    await trackingLink.click();

    // คาดหวังว่าระบบจะต้องแสดงกล่องข้อมูลพัสดุ (ซึ่งในระบบจริงจะเงียบหายและเกิด Timeout)
    await expect(page.getByText('ข้อมูลพัสดุ')).toBeVisible();
  });

  test('TC-057: หน้าระบบจัดการพัสดุ - กลับหน้าผู้ใช้งาน (Pass)', async ({ page }) => {
    // เปลี่ยนจาก 'button' เป็น 'link' เพื่อให้ตรงกับ HTML Tag จริงของระบบ
    await page.getByRole('link', { name: '← กลับหน้าผู้ใช้งาน' }).click();

    // คาดหวังว่าระบบจะพากลับไปหน้าแรกสุดของระบบ
    await page.waitForURL('https://smart-logistic-erp.netlify.app/');
    await expect(page).toHaveURL('https://smart-logistic-erp.netlify.app/');
  });

  test('TC-058: หน้าระบบจัดการพัสดุ - ออกจากระบบ (Pass)', async ({ page }) => {
    // เปลี่ยนจาก 'button' เป็น 'link' เช่นเดียวกัน
    await page.getByRole('link', { name: 'ออกจากระบบ' }).click();

    // คาดหวังว่าระบบจะส่งกลับมาที่หน้าเข้าสู่ระบบ
    await expect(page).toHaveURL(/.*login/);
  });
});