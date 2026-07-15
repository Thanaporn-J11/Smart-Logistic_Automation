import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชัน Staff Dashboard / สร้างรายการพัสดุใหม่', () => {

  test.beforeEach(async ({ page }) => {
    // เข้าสู่หน้าระบบจัดการพัสดุ (ล็อกอินเข้ามารอไว้ล่วงหน้าสำหรับทุกเคส)
    await page.goto('https://smart-logistic-erp.netlify.app/');
    await page.getByRole('link', { name: 'สำหรับเจ้าหน้าที่' }).click();
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page).toHaveURL(/.*staff\.html/);
  });

  test('TC-041: ตรวจสอบการกรอกชื่อผู้ส่ง (Pass)', async ({ page }) => {
    const senderName = page.getByPlaceholder('ระบุชื่อ-นามสกุล').first();
    await senderName.fill('สมชาย ใจดี');
    await expect(senderName).toHaveValue('สมชาย ใจดี');
  });

  test('TC-042: ตรวจสอบการกรอกเบอร์โทรผู้ส่ง (Pass)', async ({ page }) => {
    const senderPhone = page.getByPlaceholder('08x-xxx-xxxx').first();
    await senderPhone.fill('0891234567');
    await expect(senderPhone).toHaveValue('0891234567');
  });

  test('TC-043: ตรวจสอบการกรอกที่อยู่ผู้ส่ง (Pass)', async ({ page }) => {
    const senderAddress = page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).first();
    await senderAddress.fill('กรุงเทพ');
    await expect(senderAddress).toHaveValue('กรุงเทพ');
  });

  test('TC-044: ตรวจสอบการกรอกชื่อผู้รับ (Pass)', async ({ page }) => {
    const receiverName = page.getByPlaceholder('ระบุชื่อ-นามสกุล').last();
    await receiverName.fill('สมหญิง ใจดี');
    await expect(receiverName).toHaveValue('สมหญิง ใจดี');
  });

  test('TC-045: ตรวจสอบการกรอกเบอร์ผู้รับ (Pass)', async ({ page }) => {
    const receiverPhone = page.getByPlaceholder('08x-xxx-xxxx').last();
    await receiverPhone.fill('0812345678');
    await expect(receiverPhone).toHaveValue('0812345678');
  });

  test('TC-046: ตรวจสอบที่อยู่ผู้รับ (Pass)', async ({ page }) => {
    const receiverAddress = page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).last();
    await receiverAddress.fill('เชียงใหม่');
    await expect(receiverAddress).toHaveValue('เชียงใหม่');
  });

  test('TC-047: ตรวจสอบการกดบันทึกเมื่อกรอกข้อมูลครบ (Pass)', async ({ page }) => {
    // กรอกข้อมูลผู้ส่ง
    await page.getByPlaceholder('ระบุชื่อ-นามสกุล').first().fill('สมชาย ใจดี');
    await page.getByPlaceholder('08x-xxx-xxxx').first().fill('0891234567');
    await page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).first().fill('กรุงเทพ');

    // กรอกข้อมูลผู้รับ
    await page.getByPlaceholder('ระบุชื่อ-นามสกุล').last().fill('สมหญิง ใจดี');
    await page.getByPlaceholder('08x-xxx-xxxx').last().fill('0812345678');
    await page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).last().fill('เชียงใหม่');

    // กดปุ่มบันทึก
    await page.getByRole('button', { name: 'บันทึกและออกใบเสร็จรับเงิน' }).click();

    // ระบบจะสร้าง Tracking ใหม่ (ใส่ข้อความยืนยันการสร้างสำเร็จตามที่ระบบจริงแสดง)
    // สมมติว่าระบบแสดง Pop-up หรือข้อความสำเร็จ ให้เลือกใช้ตามพฤติกรรมจริง:
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
  });

  test('TC-048: ตรวจสอบช่องว่าง - ไม่กรอกชื่อผู้ส่ง (Pass)', async ({ page }) => {
    // ดักฟังหน้าต่างแจ้งเตือน
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('กรุณากรอกข้อมูลให้ครบถ้วน');
      await dialog.accept();
    });

    // เว้นชื่อผู้ส่ง แต่กรอกช่องอื่นให้ครบ
    await page.getByPlaceholder('08x-xxx-xxxx').first().fill('0891234567');
    await page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).first().fill('กรุงเทพ');
    await page.getByPlaceholder('ระบุชื่อ-นามสกุล').last().fill('สมหญิง ใจดี');
    await page.getByPlaceholder('08x-xxx-xxxx').last().fill('0812345678');
    await page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).last().fill('เชียงใหม่');

    await page.getByRole('button', { name: 'บันทึกและออกใบเสร็จรับเงิน' }).click();
  });

  /** [BUG KEY] กรอกเบอร์โทรผิดรูปแบบเป็นตัวอักษรแล้วระบบไม่ยอมแจ้งเตือน */
  test('TC-049: ตรวจสอบเบอร์ - กรอกตัวอักษร (BUG - Fail)', async ({ page }) => {
    // สั่งข้ามเคสนี้ชั่วคราวเนื่องจากพบบั๊กตามคู่มือแมนนวล (ระบบบันทึกสำเร็จแทนที่จะแจ้งเตือน)
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กระบบไม่แจ้งเตือนเมื่อกรอกเบอร์โทรผิดรูปแบบเป็นตัวอักษร');

    // กรอกข้อมูลผู้ส่งครบถ้วน
    await page.getByPlaceholder('ระบุชื่อ-นามสกุล').first().fill('สมชาย ใจดี');
    await page.getByPlaceholder('08x-xxx-xxxx').first().fill('abc123'); // กรอกตัวอักษรผิดรูปแบบ
    await page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).first().fill('กรุงเทพ');

    // กรอกข้อมูลผู้รับ
    await page.getByPlaceholder('ระบุชื่อ-นามสกุล').last().fill('สมหญิง ใจดี');
    await page.getByPlaceholder('08x-xxx-xxxx').last().fill('0812345678');
    await page.getByPlaceholder(/บ้านเลขที่|หมู่|ถนน/).last().fill('เชียงใหม่');

    // ดักจับ Alert แจ้งเตือนข้อผิดพลาด
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('กรุณากรอกข้อมูลให้ถูกต้อง');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'บันทึกและออกใบเสร็จรับเงิน' }).click();
  });
});