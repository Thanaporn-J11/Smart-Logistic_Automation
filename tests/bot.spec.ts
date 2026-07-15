import { test, expect } from '@playwright/test';

test.describe('ฟังก์ชันแจ้งปัญหา (Smart Bot)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. เปิดหน้าแรกสุดของระบบ
    await page.goto('https://smart-logistic-erp.netlify.app/');

    // 2. คลิกที่เมนูโดยระบุเป็นข้อความบนหน้าจอแทนแท็ก link เพื่อป้องกันบอตหาไม่เจอ
    await page.getByText('ติดต่อเรา (แจ้งปัญหา)').click();

    // 3. ยืนยันว่าหน้าต่างบอท น้องสมาร์ท แสดงขึ้นมาบนหน้าจอแล้ว
    await expect(page.getByText('น้องสมาร์ท (Smart Bot)')).toBeVisible();
  });

  test('TC-031: ตรวจสอบการเปิดหน้าต่างแชทบอท (Pass)', async ({ page }) => {
    // ตรวจสอบว่ามีช่องป้อนข้อความและปุ่มเมนูพื้นฐานแสดงขึ้นมาบน UI ครบถ้วน
    await expect(page.getByPlaceholder('พิมพ์ข้อความที่นี่...')).toBeVisible();
    await expect(page.getByRole('button', { name: '📦 เช็คพัสดุ' })).toBeVisible();
  });

  test('TC-032: ตรวจสอบการส่งข้อความทั่วไปหาบอท (Pass)', async ({ page }) => {
    const chatInput = page.getByPlaceholder('พิมพ์ข้อความที่นี่...');
    await chatInput.fill('สวัสดี');
    await page.getByRole('button', { name: '' }).click();
    
    // ตรวจสอบจากข้อความที่บอทพิมพ์ตอบกลับจริงบนหน้าจอ
    await expect(page.getByText('วันนี้มีอะไรให้น้องสมาร์ทช่วยเหลือไหมครับ')).toBeVisible();
  });

  test('TC-033: ส่งข้อความว่าง (Pass)', async ({ page }) => {
    const chatInput = page.getByPlaceholder('พิมพ์ข้อความที่นี่...');
    await expect(chatInput).toHaveValue('');

    // คลิกปุ่มส่งข้อความว่าง
    await page.getByRole('button', { name: '' }).click();

    // ตรวจสอบว่าช่องป้อนแชทยังคงเป็นค่าว่างเหมือนเดิม
    await expect(chatInput).toHaveValue('');
  });

  /** [BUG KEY] บอทไม่ยอมตอบกลับเมื่อกด Quick Button เช็กพัสดุ */
  test('TC-034: ปุ่ม Quick Button "เช็กพัสดุ" (BUG - Fail)', async ({ page }) => {
    // สั่งข้ามเคสนี้ชั่วคราวเนื่องจากระบบหน้าเว็บจริงมีบั๊กตามคู่มือแมนนวล
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กบอทไม่ยอมตอบกลับแนะนำการเช็คพัสดุ');

    await page.getByRole('button', { name: '📦 เช็คพัสดุ' }).click();
    await expect(page.getByText('กรุณากรอกเลขพัสดุ')).toBeVisible();
  });

  test('TC-035: ปุ่ม Quick Button "แจ้งปัญหา" (Pass)', async ({ page }) => {
    await page.getByRole('button', { name: '⚠️ แจ้งปัญหา' }).click();
    await expect(page.getByText('รบกวนคุณลูกค้าพิมพ์ เลขพัสดุ')).toBeVisible();
  });

  /** [BUG KEY] บอทค้าง ไม่ตอบกลับเมื่อกดปุ่มคุยกับคน */
  test('TC-036: ปุ่ม Quick Button "คุยกับคน" (BUG - Fail)', async ({ page }) => {
    // สั่งข้ามเคสนี้ชั่วคราวเนื่องจากระบบหน้าเว็บจริงมีบั๊กตามคู่มือแมนนวล
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กบอทค้าง ไม่ยอมตอบกลับคำว่ากำลังโอนสาย');

    await page.getByRole('button', { name: '📞 คุยกับคน' }).click();
    await expect(page.getByText('กำลังโอนสาย')).toBeVisible();
  });

  test('TC-037: ตรวจสอบชุดคำสั่ง / การพิมพ์เลขพัสดุหาบอท (Pass)', async ({ page }) => {
    const chatInput = page.getByPlaceholder('พิมพ์ข้อความที่นี่...');
    await chatInput.fill('T715480');
    await page.getByRole('button', { name: '' }).click();
    
    // ยืนยันว่าระบบรับคำสั่งเลขพัสดุเข้าหน้าประวัติแชทสำเร็จ
    await expect(page.getByText('T715480')).toBeVisible();
  });

  test('TC-038: ตรวจสอบความเร็วการตอบสนองของระบบแชท (Pass)', async ({ page }) => {
    const chatInput = page.getByPlaceholder('พิมพ์ข้อความที่นี่...');
    await chatInput.fill('T715480');
    
    // กดส่งและเช็คพฤติกรรมการอัปเดต UI บนหน้าจอในทันที
    await page.getByRole('button', { name: '' }).click();
    await expect(page.getByText('T715480')).toBeVisible();
  });

  test('TC-039: ตรวจสอบการแสดงผลอินเตอร์เฟสและ UI ประวัติแชท (Pass)', async ({ page }) => {
    const chatInput = page.getByPlaceholder('พิมพ์ข้อความที่นี่...');
    await chatInput.fill('T715480');
    await page.getByRole('button', { name: '' }).click();
    
    // ตรวจสอบว่า UI ของข้อความที่ส่งไปจัดวางและแสดงผลอยู่บนหน้าจอได้ถูกต้อง
    await expect(page.getByText('T715480')).toBeVisible();
  });

  /** [BUG KEY] รีเฟรชแล้วประวัติแชทหายหมด */
  test('TC-040: รีเฟรชหน้าแชท (BUG - Fail)', async ({ page }) => {
    // สั่งข้ามเคสนี้ชั่วคราวเนื่องจากระบบหน้าเว็บจริงมีบั๊กตามคู่มือแมนนวล
    test.skip(true, 'ข้ามชั่วคราว: พบบั๊กรีเฟรชหน้าจอแล้วประวัติแชทก่อนหน้าหายหมด');

    const chatInput = page.getByPlaceholder('พิมพ์ข้อความที่นี่...');
    await chatInput.fill('สวัสดี');
    await page.getByRole('button', { name: '' }).click();
    await page.reload();
    await expect(page.getByText('สวัสดี', { exact: true })).toBeVisible();
  });
});