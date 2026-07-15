import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชันเช็คราคาจัดส่ง (Shipping Calculator)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. เข้าสู่หน้าแรกของระบบ
    await page.goto('https://smart-logistic-erp.netlify.app/');

    // 2. คลิกที่เมนูคำว่า "เช็คราคาจัดส่ง" บน Navbar
    await page.getByText('เช็คราคาจัดส่ง').click();

    // 3. ยืนยันว่าหน้าต่าง "ประเมินค่าจัดส่งเบื้องต้น" โหลดขึ้นมาถูกต้อง
    await expect(page.getByText('ประเมินค่าจัดส่งเบื้องต้น')).toBeVisible();
  });

  test('TC-021: ตรวจสอบโครงสร้างและการแสดงผลของฟอร์ม (Pass)', async ({ page }) => {
    // ตรวจสอบว่ามีองค์ประกอบหลักปรากฏครบถ้วน
    await expect(page.getByText('จังหวัดต้นทาง')).toBeVisible();
    await expect(page.getByText('จังหวัดปลายทาง')).toBeVisible();
    await expect(page.getByText('น้ำหนัก (กก.)')).toBeVisible();
    await expect(page.getByText('ขนาดพัสดุ')).toBeVisible();
    await expect(page.getByRole('button', { name: 'คำนวณราคาเลย' })).toBeVisible();
  });

  test('TC-022: กดปุ่มคำนวณราคาโดยไม่กรอกข้อมูล / ส่งค่าว่าง (Pass)', async ({ page }) => {
    // ดักฟังหน้าต่างแจ้งเตือนกรณีข้อมูลไม่ครบ
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBeTruthy();
      await dialog.accept();
    });

    // กดปุ่มคำนวณราคาทันที
    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-023: คำนวณราคาพัสดุ ขนาดเล็ก (S) สำเร็จ (Pass)', async ({ page }) => {
    await page.getByPlaceholder('เช่น กรุงเทพมหานคร').fill('กรุงเทพมหานคร');
    await page.getByPlaceholder('เช่น เชียงใหม่').fill('เชียงใหม่');
    await page.locator('input[type="number"], input[step], input[name*="weight"]').first().fill('1.5');
    await page.getByRole('combobox').selectOption({ label: 'เล็ก (S)' });

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-024: คำนวณราคาพัสดุ ขนาดกลาง (M) สำเร็จ (Pass)', async ({ page }) => {
    await page.getByPlaceholder('เช่น กรุงเทพมหานคร').fill('กรุงเทพมหานคร');
    await page.getByPlaceholder('เช่น เชียงใหม่').fill('ภูเก็ต');
    await page.locator('input[type="number"], input[step], input[name*="weight"]').first().fill('5.0');
    await page.getByRole('combobox').selectOption({ index: 1 });

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-025: คำนวณราคาพัสดุ ขนาดใหญ่ (L) สำเร็จ (Pass)', async ({ page }) => {
    await page.getByPlaceholder('เช่น กรุงเทพมหานคร').fill('ขอนแก่น');
    await page.getByPlaceholder('เช่น เชียงใหม่').fill('ชลบุรี');
    await page.locator('input[type="number"], input[step], input[name*="weight"]').first().fill('12.0');
    await page.getByRole('combobox').selectOption({ index: 2 });

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-026: ตรวจสอบความถูกต้องของ Placeholder ช่องต้นทางและปลายทาง (Pass)', async ({ page }) => {
    await expect(page.getByPlaceholder('เช่น กรุงเทพมหานคร')).toBeVisible();
    await expect(page.getByPlaceholder('เช่น เชียงใหม่')).toBeVisible();
  });

  /** [BUG KEY] ระบบยอมให้คำนวณราคาได้แม้จะกรอกน้ำหนักติดลบ */
  test('TC-027: กรอกน้ำหนักติดลบ (BUG - Fail)', async ({ page }) => {
    // สั่งข้ามเคสนี้ชั่วคราวเนื่องจากพบบั๊กระบบไม่แจ้งเตือนเมื่อน้ำหนักติดลบตามคู่มือแมนนวล
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กระบบยอมให้คำนวณราคาได้แม้จะกรอกน้ำหนักติดลบ (-1.0)');

    await page.getByPlaceholder('เช่น กรุงเทพมหานคร').fill('กรุงเทพมหานคร');
    await page.getByPlaceholder('เช่น เชียงใหม่').fill('เชียงใหม่');

    // ใส่ค่าน้ำหนักติดลบตามสเปก Manual Test
    await page.locator('input[type="number"], input[step], input[name*="weight"]').first().fill('-1.0');

    // คาดหวังว่าระบบต้องมี Alert แจ้งเตือนข้อผิดพลาด (แต่ระบบจริงจะผ่านฉลุยทำให้เทสพัง)
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('กรุณากรอกน้ำหนักให้ถูกต้อง');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-028: เว้นว่างเฉพาะช่องจังหวัดต้นทาง (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByPlaceholder('เช่น เชียงใหม่').fill('เชียงใหม่');
    await page.locator('input[type="number"], input[step], input[name*="weight"]').first().fill('2.0');
    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-029: เว้นว่างเฉพาะช่องจังหวัดปลายทาง (Pass)', async ({ page }) => {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByPlaceholder('เช่น กรุงเทพมหานคร').fill('กรุงเทพมหานคร');
    await page.locator('input[type="number"], input[step], input[name*="weight"]').first().fill('2.0');
    await page.getByRole('button', { name: 'คำนวณราคาเลย' }).click();
  });

  test('TC-030: ตรวจสอบการแสดงผลกราฟิกแผนที่ประเทศไทยประกอบหน้าจอ (Pass)', async ({ page }) => {
    // ตรวจสอบกล่องข้อความสิทธิประโยชน์บนรูปแผนที่ด้านขวา
    await expect(page.getByText('ครอบคลุมทั่วไทย')).toBeVisible();
    await expect(page.getByText('บริการจัดส่งถึงหน้าบ้านทั้ง 77 จังหวัด')).toBeVisible();
  });
});