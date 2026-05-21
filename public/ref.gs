// ========================================
// Google Apps Script for Larn English App
// เวอร์ชัน 1.0.0 - ระบบจัดการข้อมูลคำศัพท์ผ่าน Google Sheets
// ========================================
// 
// 📌 คำแนะนำการใช้งาน:
// 1. เปิด Google Sheet ของคุณ (https://docs.google.com/spreadsheets/d/1rY3ra_nalNajzrxZahA0cJCoqW5rJhsDbDlf0z9d2sQ)
// 2. ไปที่เมนู ส่วนขยาย (Extensions) → Apps Script
// 3. คัดลอกโค้ดทั้งหมดในไฟล์นี้ไปวางแทนที่โค้ดในตัวแก้ไขของ Apps Script
// 4. กดปุ่มบันทึก (Ctrl+S)
// 5. คลิกเมนู ทำให้ใช้งานได้ (Deploy) → การทำให้ใช้งานได้ใหม่ (New deployment)
//    - เลือกประเภทเป็น: "เว็บแอป" (Web app)
//    - ผู้ใช้ที่เรียกใช้ (Execute as): "ฉัน" (Me)
//    - ผู้มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone) ⚠️ สำคัญมาก! เพื่อให้บราวเซอร์ดึงข้อมูลได้โดยไม่ต้องล็อกอิน
// 6. คลิก Deploy แล้วคัดลอก "URL เว็บแอป" (Web app URL) ไปวางในเมนู Cloud Sync ของแอปพลิเคชันค่ะ
//
// ========================================

const DEFAULT_SHEET_NAME = 'VocabData'; // ชื่อแผ่นงานเริ่มต้นสำหรับ Larn English App

/**
 * ฟังก์ชันสำหรับรับคำร้องขอแบบ GET (ดึงข้อมูลรายชื่อชีต หรือ ดึงข้อมูลคำศัพท์)
 */
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;

    // 🌟 กรณีที่ 1: แปลภาษาอังกฤษเป็นไทยอัตโนมัติ (API Translate)
    if (action === 'translate') {
      const text = e.parameter.text || '';
      if (!text) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'no_text', message: 'กรุณาส่งข้อความภาษาอังกฤษที่ต้องการแปลมาด้วยค่ะ' })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      try {
        const translatedText = LanguageApp.translate(text, 'en', 'th');
        return ContentService.createTextOutput(
          JSON.stringify({ original: text, translated: translatedText })
        ).setMimeType(ContentService.MimeType.JSON);
      } catch (err) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: 'translation_failed', message: err.toString() })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 🌟 กรณีที่ 2: ดึงรายชื่อแผ่นงาน (Sheets) ทั้งหมดในไฟล์นี้
    if (action === 'getSheets') {
      const allSheets = spreadsheet.getSheets().map(s => s.getName());
      return ContentService.createTextOutput(
        JSON.stringify(allSheets)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 🌟 กรณีที่ 2: ดึงข้อมูลคำศัพท์จากแผ่นงานที่เลือก
    const sheetName = e.parameter.sheetName || DEFAULT_SHEET_NAME;
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      const allSheets = spreadsheet.getSheets().map(s => s.getName());
      return ContentService.createTextOutput(
        JSON.stringify({
          error: 'Sheet not found',
          message: `ไม่พบแผ่นงานชื่อ "${sheetName}" ในไฟล์นี้ค่ะ`,
          availableSheets: allSheets,
          hint: `กรุณาเลือกแผ่นงานที่มีอยู่ หรือพิมพ์ชื่อสร้างแผ่นงานใหม่จากกล่องตั้งค่าในแอป`
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();

    // กรณีไม่มีข้อมูลเลย
    if (data.length === 0 || (data.length === 1 && data[0][0] === '')) {
      return ContentService.createTextOutput(
        JSON.stringify([])
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // กรณีมีแต่หัวแถว ไม่มีเนื้อหา
    if (data.length === 1) {
      return ContentService.createTextOutput(
        JSON.stringify({
          error: 'No data',
          message: `แผ่นงาน "${sheetName}" ยังไม่มีข้อมูลคำศัพท์ค่ะ`,
          hint: 'กรุณากรอกข้อมูลคำศัพท์โดยเริ่มจากแถวที่ 2 เป็นต้นไป'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ปรับชื่อ header ให้เป็นตัวเล็กและตัดช่องว่าง
    const headers = data[0].map(h => h.toString().trim().toLowerCase());
    const rows = data.slice(1);

    // ตรวจสอบหัวตารางขั้นต่ำ
    const requiredHeaders = ['session', 'en', 'th'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return ContentService.createTextOutput(
        JSON.stringify({
          error: 'Invalid headers',
          message: `โครงสร้างคอลัมน์ในแผ่นงาน "${sheetName}" ไม่ถูกต้องค่ะ ขาดหัวข้อคอลัมน์: ${missingHeaders.join(', ')}`,
          currentHeaders: headers,
          requiredHeaders: requiredHeaders,
          hint: 'แถวแรกของแผ่นงานต้องมีหัวข้อดังนี้สะกดในภาษาอังกฤษตัวเล็ก: session, en, th และ image'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // แปลงข้อมูลแถวเป็น JSON Array
    const jsonData = rows
      .filter(row => row[headers.indexOf('en')] !== '' && row[headers.indexOf('en')] !== null) // กรองแถวที่ไม่มีคำศัพท์ออก
      .map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          if (header === 'session') {
            obj[header] = parseInt(row[index]) || 1;
          } else {
            obj[header] = row[index] || '';
          }
        });
        
        // รับประกันว่าต้องมีฟิลด์ image เสมอ ป้องกันแอปพัง
        if (!obj.hasOwnProperty('image')) {
          obj['image'] = '';
        }
        return obj;
      });

    return ContentService.createTextOutput(
      JSON.stringify(jsonData)
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error: 'Server error',
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันสำหรับรับคำร้องขอแบบ POST (ส่งข้อมูลขึ้นบันทึกทับในชีต)
 */
function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'error',
          message: 'ข้อมูล JSON ที่ส่งมามีรูปแบบไม่ถูกต้องค่ะ',
          details: parseError.toString()
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    let sheetName = e.parameter.sheetName || DEFAULT_SHEET_NAME;
    let vocabList = [];

    if (Array.isArray(requestData)) {
      vocabList = requestData;
    } else if (typeof requestData === 'object' && requestData !== null) {
      sheetName = requestData.sheetName || sheetName;
      vocabList = requestData.data || [];
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'error',
          message: 'รูปแบบของข้อมูลที่ส่งมาไม่ถูกต้อง (ต้องเป็น Array หรือ Object)'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    let sheet = spreadsheet.getSheetByName(sheetName);
    let isNewSheetCreated = false;

    // ถ้าไม่มีชีตนี้ ให้สร้างใหม่พร้อมหัวคอลัมน์อัตโนมัติ
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow(['session', 'en', 'th', 'image']);
      isNewSheetCreated = true;
    }

    // ล้างข้อมูลเดิมทั้งหมดยกเว้น header
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

    // บันทึกหัวคอลัมน์ให้เรียบร้อยสวยงาม
    const headers = ['session', 'en', 'th', 'image'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // เขียนข้อมูลคำศัพท์ชุดใหม่ลงไป
    if (vocabList.length > 0) {
      const newRows = vocabList.map(item => {
        let thVal = item.th || '';
        const enVal = item.en || '';
        // กรณีไม่มีคำแปลภาษาไทย แต่มีภาษาอังกฤษ ให้ระบบแปลงให้อัตโนมัติทางฝั่งเซิร์ฟเวอร์ค่ะ
        if (!thVal && enVal) {
          try {
            thVal = LanguageApp.translate(enVal, 'en', 'th');
          } catch (transErr) {
            thVal = '';
          }
        }
        return [
          parseInt(item.session) || 1,
          enVal,
          thVal,
          item.image || item.img || ''
        ];
      });

      sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        count: vocabList.length,
        sheetName: sheetName,
        isNewSheet: isNewSheetCreated,
        message: isNewSheetCreated ? `สร้างแผ่นงานใหม่ "${sheetName}" และอัปโหลดสำเร็จแล้วค่ะ` : `อัปเดตแผ่นงาน "${sheetName}" สำเร็จแล้วค่ะ`
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
