# Larn English App (React)

## วิธีใช้งานและเผยแพร่บน GitHub Pages

1. ติดตั้ง dependencies (ครั้งแรกเท่านั้น):

   ```sh
   npm install
   ```

2. ทดสอบแอปบนเครื่อง:

   ```sh
   npm run dev
   ```

3. Build สำหรับ production:

   ```sh
   npm run build
   ```

4. Deploy ไปยัง GitHub Pages:

   - แก้ไขไฟล์ `vite.config.js` ให้ base เป็นชื่อ repo ของคุณ เช่น `/larn-english-app/`
   - เพิ่ม repository ใน GitHub และ push โค้ดนี้ขึ้นไป
   - ติดตั้ง gh-pages (ถ้ายังไม่ได้ติดตั้ง):
     ```sh
     npm install gh-pages --save-dev
     ```
   - Deploy:
     ```sh
     npm run deploy
     ```
   - ตั้งค่า GitHub Pages ให้ใช้ branch `gh-pages` และโฟลเดอร์ `/` (root)

5. เข้าใช้งานผ่าน URL:
   - `https://<username>.github.io/<repo-name>/`

---

- โค้ดหลักอยู่ที่ `src/App.jsx`
- สามารถแก้ไขคำศัพท์หรือ UI ได้ตามต้องการ
- รองรับการใช้งานบนมือถือและเดสก์ท็อป
