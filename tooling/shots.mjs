/**
 * Chụp ảnh trang docs ở CẢ BỐN tổ hợp theme × mode.
 *
 * Đây là thứ thay Storybook trong kế hoạch, và lý do không phải là tiết kiệm: một trang web không
 * tự hover được cho chính nó. `hover`, `active` và `focus-visible` là pseudo-class CSS — ma trận
 * vi-trạng thái trong `/components/[name]` phải ghi "tự trỏ vào để xem" cho ba ô đó. Playwright thì
 * hover được THẬT, Tab được THẬT, rồi chụp lại. Nó làm được đúng phần mà trang demo không làm được.
 *
 *   node tooling/shots.mjs            # cần server đang chạy ở :4321
 *   node tooling/shots.mjs --out dir  # đổi chỗ lưu
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d) => {
  const i = argv.indexOf('--' + n);
  return i === -1 ? d : argv[i + 1];
};
const BASE = flag('base', 'http://localhost:4321');
const OUT = flag('out', 'shots');

const PAGES = [
  { name: 'home', path: '/', full: true },
  { name: 'tokens', path: '/tokens', full: false },
  { name: 'components', path: '/components', full: true, onlyDefault: true },
  { name: 'button', path: '/components/button', full: true, onlyDefault: true },
  { name: 'data-table', path: '/components/data-table', full: true, onlyDefault: true },
  { name: 'card-deck', path: '/components/card-deck', full: true, onlyDefault: true },
];

const COMBOS = [
  { id: 'claude-light', brand: 'claude', dark: false },
  { id: 'claude-dark', brand: 'claude', dark: true },
  { id: 'slate-light', brand: 'slate', dark: false },
  { id: 'slate-dark', brand: 'slate', dark: true },
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];
let shots = 0;

for (const combo of COMBOS) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Gieo localStorage TRƯỚC khi trang chạy: cả hai trục theme đọc từ đó, nên đổi theme bằng cách
  // bấm vào UI sẽ chậm hơn và phụ thuộc vào việc tìm đúng nút.
  await ctx.addInitScript(
    ([b, d]) => {
      localStorage.setItem('thienui-brand', b);
      localStorage.setItem('theme', d ? 'dark' : 'light');
    },
    [combo.brand, combo.dark]
  );
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${combo.id}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${combo.id} console: ${m.text()}`);
  });

  for (const p of PAGES) {
    if (p.onlyDefault && combo.id !== 'claude-light') continue;
    await page.goto(BASE + p.path, { waitUntil: 'networkidle' });

    // ĐỌC LẠI hai attribute để chứng minh theme đã áp, không chỉ tin là đã áp. Nếu brand provider
    // vỡ thì `data-theme` sẽ vắng và ảnh vẫn trông "đúng" — vì theme mặc định cũng là claude.
    const applied = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme ?? '(vắng)',
      dark: document.documentElement.classList.contains('dark'),
      bg: getComputedStyle(document.body).backgroundColor,
    }));
    if (applied.theme !== combo.brand) errors.push(`${combo.id}${p.path}: data-theme=${applied.theme}, cần ${combo.brand}`);
    if (applied.dark !== combo.dark) errors.push(`${combo.id}${p.path}: dark=${applied.dark}, cần ${combo.dark}`);
    console.log(
      `${combo.id.padEnd(14)} ${p.path.padEnd(20)} data-theme=${applied.theme.padEnd(7)} dark=${String(applied.dark).padEnd(5)} bg=${applied.bg}`
    );

    await page.screenshot({ path: `${OUT}/${p.name}-${combo.id}.png`, fullPage: p.full });
    shots++;
  }
  await ctx.close();
}
await browser.close();

console.log('');
if (errors.length) {
  console.error('✗ ' + errors.length + ' vấn đề:');
  for (const e of [...new Set(errors)]) console.error('  ' + e);
  process.exit(1);
}
console.log(`✓ ${shots} ảnh trong ${OUT}/ · 4 tổ hợp theme × mode · không lỗi runtime, không console error`);
