/**
 * Quét MỌI trang component của showcase và kiểm hai thứ:
 *   1. không có lỗi console / lỗi runtime
 *   2. khối demo thật sự render ra NỘI DUNG (không rỗng, không còn chữ "Chưa có demo")
 *
 * Bài học pha 6: build xanh chỉ chứng minh SSR chạy. Một component chưa ai render thật có thể mang
 * ba lỗi cùng lúc và vẫn nằm trong registry ở trạng thái "xong".
 */
import { chromium } from '/home/thien/projects/thienui/node_modules/@playwright/test/index.mjs';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const items = JSON.parse(readFileSync('/home/thien/projects/thienui/apps/docs/registry.json', 'utf8')).items
  .filter((i) => i.type !== 'registry:theme')
  .map((i) => i.name);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const xau = [];

for (const name of items) {
  const page = await ctx.newPage();
  const loi = [];
  page.on('console', (m) => {
    if (m.type() === 'error') loi.push(m.text().slice(0, 200));
  });
  page.on('pageerror', (e) => loi.push('pageerror: ' + String(e.message).slice(0, 200)));
  try {
    await page.goto(`${BASE}/components/${name}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(250);
    const chuaCoDemo = await page.locator('text=Chưa có demo').count();
    const text = (await page.locator('main, body').first().innerText()).length;
    const loiThat = loi.filter((x) => !/favicon|404 \(Not Found\)|Download the React DevTools/i.test(x));
    if (chuaCoDemo || loiThat.length) {
      xau.push({ name, chuaCoDemo: !!chuaCoDemo, loi: loiThat.slice(0, 2), text });
    }
  } catch (e) {
    xau.push({ name, loi: ['NAV: ' + String(e.message).split('\n')[0]] });
  }
  await page.close();
}
await browser.close();

console.log(`đã quét ${items.length} trang`);
if (!xau.length) console.log('✓ không trang nào có lỗi console, và mọi trang đều có demo');
for (const x of xau) console.log('✗', x.name, JSON.stringify(x));
process.exit(xau.length ? 1 : 0);
