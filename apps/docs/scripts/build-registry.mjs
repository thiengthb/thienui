/**
 * Sinh registry.json từ CÂY THƯ MỤC và từ @thienui/tokens.
 *
 * Vì sao sinh thay vì viết tay: một registry.json viết tay sẽ lệch với thực tế ngay lần thêm component
 * thứ ba — ai cũng quên cập nhật nó, và `shadcn add` thì thất bại với lỗi 404 chứ không nói là thiếu khai.
 * Ở đây cây thư mục LÀ bản khai: thêm một file vào registry/patterns/ là nó tự có mặt trong registry.
 *
 * Bốn tầng, và thứ tự này cũng là thứ tự phụ thuộc được phép:
 *   base/     primitive shadcn trên Base UI — tầng DUY NHẤT được import @base-ui/react
 *   lib/      thư viện dùng chung, không phải component (motion, format)
 *   patterns/ generic đã ghép (data-table, confirm-dialog, empty-state)
 *   shells/   khung app & layout
 *   blocks/   cả màn hình
 * Cộng themes/ sinh từ token (registry:theme), và _quarantine/ KHÔNG BAO GIỜ được xuất bản.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { PUBLIC_URL } from '../registry.config.mjs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REG = join(ROOT, 'registry');

const TIERS = [
  { dir: 'base', type: 'registry:ui', note: 'primitive' },
  { dir: 'lib', type: 'registry:lib', note: 'thư viện dùng chung' },
  { dir: 'patterns', type: 'registry:component', note: 'generic đã ghép' },
  { dir: 'shells', type: 'registry:component', note: 'khung app' },
  { dir: 'blocks', type: 'registry:block', note: 'cả màn hình' },
];

/**
 * Sinh `registry/lib/motion-tokens.ts` — token chuyển động dưới dạng JS, cho `lib/motion.ts`.
 *
 * Vì sao phải sinh: `motion.ts` cần giá trị spring dưới dạng SỐ (stiffness, damping), và spring
 * không phải CSS nên theme không mang được. Trước pha 6 nó import thẳng `@thienui/tokens`, nên
 * `motion.json` khai một dependency npm chưa publish — và `shadcn add` ở project ngoài chết cả lô
 * ngay ở bước `pnpm add @thienui/tokens` (404), kéo theo 13 item không liên quan.
 *
 * Chỉ `motion.*`, KHÔNG kèm màu: màu đã đi qua theme, và một file thứ hai chứa màu sẽ thành nguồn
 * sự thật thứ hai trong project người dùng.
 */
function sinhMotionTokens(primitive) {
  const picked = Object.entries(primitive).filter(([k]) => k.startsWith('motion.'));
  const body = picked.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(String(v))},`).join('\n');
  const src = [
    '// SINH TỰ ĐỘNG bởi scripts/build-registry.mjs từ @thienui/tokens — ĐỪNG SỬA TAY.',
    '// Chạy lại: pnpm registry:gen',
    'export const primitive = {',
    body,
    '} as const;',
    '',
  ].join('\n');
  const target = join(REG, 'lib/motion-tokens.ts');
  const truoc = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (truoc !== src) writeFileSync(target, src);
  return picked.length;
}

const tokens = JSON.parse(readFileSync(join(ROOT, 'node_modules/@thienui/tokens/dist/tokens.json'), 'utf8'));
sinhMotionTokens(tokens.primitive);

const items = [];

/* ── component theo bốn tầng ── */
for (const tier of TIERS) {
  const dir = join(REG, tier.dir);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).sort()) {
    if (!['.tsx', '.ts'].includes(extname(f))) continue;
    if (f.startsWith('_')) continue;
    const name = basename(f, extname(f));
    const src = readFileSync(join(dir, f), 'utf8');

    // Hook có type RIÊNG trong schema của shadcn (`registry:hook`), và nó không chỉ là nhãn: CLI
    // dùng type để quyết file hạ cánh ở alias nào bên project tiêu thụ. Gắn sai thì một hook sẽ
    // được đặt vào thư mục ui/ của họ.
    const isHook = extname(f) === '.ts' && name.startsWith('use-');
    const type = isHook ? 'registry:hook' : tier.type;

    // registryDependencies: suy từ chính import của file, nên nó không thể lệch với code.
    //
    // PHẢI có tiền tố `@thienui/`. Tên trần được shadcn giải về registry MẶC ĐỊNH của nó
    // (ui.shadcn.com), không về registry mà item vừa được lấy từ đó. Pha 6 đo được hậu quả: 6 item
    // chết 404 ở project ngoài, và 26 item khác im lặng lấy file của upstream — kể cả khi `base/`
    // đã được vá. Xem docs/vendor-patches.md.
    //
    // Danh sách tầng phải khớp TIERS; thiếu `lib` ở đây là lý do `pressable` từng xuất bản mà không
    // khai phụ thuộc `motion` nào, nên nó về máy người dùng ở trạng thái không import được.
    const deps = new Set();
    const tierAlt = TIERS.map((t) => t.dir).join('|');
    for (const m of src.matchAll(new RegExp(`from\\s+['"]@/registry/(?:${tierAlt})/([\\w-]+)['"]`, 'g'))) {
      if (m[1] !== name) deps.add(`@thienui/${m[1]}`);
    }
    // dependencies npm: chỉ những package ngoài, bỏ alias nội bộ và react.
    const npm = new Set();
    for (const m of src.matchAll(/from\s+['"]([^'".@/][^'"]*|@[^'"/]+\/[^'"]+)['"]/g)) {
      const p = m[1].startsWith('@') ? m[1].split('/').slice(0, 2).join('/') : m[1].split('/')[0];
      if (!['react', 'react-dom', 'next'].includes(p)) npm.add(p);
    }

    items.push({
      name,
      type,
      title: name,
      description: `${isHook ? 'hook' : tier.note} · ${name}`,
      ...(npm.size ? { dependencies: [...npm].sort() } : {}),
      ...(deps.size ? { registryDependencies: [...deps].sort() } : {}),
      files: [{ path: `registry/${tier.dir}/${f}`, type }],
    });
  }
}

/* ── theme sinh từ token ── */

/**
 * Thang PHI-MÀU đi kèm theme, giá trị đã resolve.
 *
 * Pha 6 đo được: một project ngoài cài `@thienui/theme-claude` thì có đủ 46 token màu, nhưng
 * `text-caption1` / `ease-overshoot` / `max-w-prose` **không phải class** ở đó, và
 * `var(--p-motion-duration-base)` là rỗng — trong khi `app-sidebar`, `bulk-action-button`,
 * `card-deck`, `lib/motion` đang dùng đúng những thứ đó. Cả hai đều hỏng IM LẶNG: biến CSS thiếu
 * thì thuộc tính bị bỏ, class chưa khai thì Tailwind không sinh ra gì.
 *
 * Nguyên nhân: thang này đi đường npm (`@thienui/tokens`) còn component đi đường registry, và chỉ
 * đường registry là có thật. Chừng nào npm chưa mở, theme phải gánh cả hai.
 *
 * Giá trị LITERAL chứ không `var(--p-*)`: consumer không có tầng 1 để var() trỏ tới — đúng cùng lý
 * do mà token màu đã được làm phẳng ở đây từ đầu.
 */
/** Giống `cssValue` của packages/tokens: mảng [x1,y1,x2,y2] LÀ một cubic-bezier, không phải chuỗi. */
const giaTriCss = (v) => (Array.isArray(v) ? `cubic-bezier(${v.join(', ')})` : String(v));

const NS = [
  ['type.', '--text-'],
  ['tracking.', '--tracking-'],
  ['leading.', '--leading-'],
  ['weight.', '--font-weight-'],
  ['measure.', '--container-'],
  ['radius.', '--radius-'],
  ['motion.easing.', '--ease-'],
];
const scaleTheme = {};
for (const [prefix, ns] of NS) {
  for (const [path, value] of Object.entries(tokens.primitive)) {
    if (path.startsWith(prefix)) scaleTheme[`${ns}${path.slice(prefix.length)}`] = giaTriCss(value);
  }
}

/**
 * Primitive chuyển động, giữ NGUYÊN tên `--p-motion-*`.
 *
 * Chúng không vào `cssVars.theme` được: `@theme` của Tailwind chỉ hiểu một tập namespace, và
 * Tailwind **không có** namespace cho duration — `duration-*` đọc thang riêng. Nên component đọc
 * thẳng biến, và biến phải được khai ở `:root` như một biến CSS thường. Khối `css` làm đúng việc đó
 * mà không bị shadcn tự sinh thêm `--color-*` như khi đi qua `cssVars`.
 */
const motionRoot = {};
for (const [path, value] of Object.entries(tokens.primitive)) {
  if (path.startsWith('motion.duration.') || path.startsWith('motion.easing.')) {
    motionRoot[`--p-${path.replace(/\./g, '-')}`] = giaTriCss(value);
  }
}

/**
 * Vùng chạm `.target-44`, cùng định nghĩa với `@thienui/tokens/base.css`.
 *
 * Cùng lỗi pha 6 với thang phi-màu ở trên: `info-tooltip`, `bulk-action-button`, `card-deck`,
 * `app-shell` và `Button` đều gắn class `target-44`, nhưng base.css đi đường npm nên ở project
 * tiêu thụ class đó KHÔNG được khai — nút vẫn hiện, chỉ là vùng bấm không nở ra, và không gì báo.
 * Giá trị literal vì consumer không có `--p-target-*`.
 */
const vungCham = (min) => ({
  content: "''",
  position: 'absolute',
  inset: '50% auto auto 50%',
  translate: '-50% -50%',
  'min-width': min,
  'min-height': min,
  width: '100%',
  height: '100%',
});
const targetCss = {
  '@layer base': {
    '.target-44': { position: 'relative' },
    '.target-44::before': vungCham(giaTriCss(tokens.primitive['target.wcag'])),
    '@media (pointer: coarse)': {
      '.target-44::before': {
        'min-width': giaTriCss(tokens.primitive['target.min']),
        'min-height': giaTriCss(tokens.primitive['target.min']),
      },
    },
  },
};

/*
 * CỔNG: không giá trị nào được là một DÃY SỐ TRẦN.
 *
 * Lỗi đã xảy ra: `motion.easing.*` lưu `[0.2, 1.4, 0.4, 1]`, và `String(value)` cho ra
 * `0.2,1.4,0.4,1` — không phải giá trị CSS. Trình duyệt bỏ qua khai báo đó, không báo gì, và
 * `ease-overshoot` lặng lẽ không còn easing. Cùng một hình dạng với lỗi `--p-warm-light-1` ở pha 1:
 * CSS sai thì im lặng, nên cổng phải đứng ở chỗ sinh ra nó.
 */
for (const [ten, gia] of [...Object.entries(scaleTheme), ...Object.entries(motionRoot)]) {
  if (/^[\d.\s-]+(,[\d.\s-]+)+$/.test(gia)) {
    throw new Error(`token "${ten}" ra một dãy số trần: ${gia} — thiếu hàm CSS bọc ngoài?`);
  }
}

for (const meta of tokens.meta) {
  const t = tokens.themes[meta.name];
  // cssVars của shadcn nhận giá trị ĐÃ RESOLVE: một project tiêu thụ chỉ cài theme, không cài cả
  // tầng primitive, nên ở đó không có --p-* nào để var() trỏ tới. Đây là chỗ duy nhất trong hệ mà
  // ba tầng được làm phẳng — và nó đúng, vì consumer nhận một theme chứ không nhận một hệ token.
  items.push({
    name: `theme-${meta.name}`,
    type: 'registry:theme',
    title: meta.label,
    description: `Theme ${meta.label}${meta.default ? ' (mặc định)' : ''} — token ngữ nghĩa đã resolve, sáng + tối.`,
    cssVars: { theme: scaleTheme, light: t.light, dark: t.dark },
    css: { ':root': motionRoot, ...targetCss },
  });
}

/**
 * Bộ cổng (`@thienui/guards` + 37 luật + token đã build) dưới dạng FILE chép vào project tiêu thụ.
 *
 * Ba package `@thienui/*` chưa lên npm, và npm không cài được một thư mục con của repo git — nên một
 * project dùng npm (sakubun) không có đường nào chạy được cổng. Quyết định 2026-10-24 (thien): chép
 * vào qua registry thay vì publish. Cập nhật luật = `shadcn add @thienui/guards --overwrite`, vẫn là
 * MỘT lệnh. Khi npm mở thì project đổi sang `pnpm add -D` và xoá `tooling/thienui-guards/`.
 *
 * Đọc từ `node_modules/@thienui/*` (symlink workspace) để file chép đi chính là file `pnpm verify`
 * vừa chạy, không phải một bản sao thứ hai có thể lệch.
 */
const GUARDS_DIR = '~/tooling/thienui-guards';
const guardsFile = (path, target) => ({ path, type: 'registry:file', target: `${GUARDS_DIR}/${target}` });
items.push({
  name: 'guards',
  type: 'registry:item',
  title: 'guards',
  description: 'cổng · contrast, gamut, 37 luật UI — chép vào tooling/thienui-guards/',
  files: [
    guardsFile('node_modules/@thienui/guards/bin/guards.mjs', 'bin/guards.mjs'),
    ...['canonical', 'contrast', 'index', 'oklch', 'pattern-lock'].map((n) =>
      guardsFile(`node_modules/@thienui/guards/src/${n}.mjs`, `src/${n}.mjs`)
    ),
    guardsFile('node_modules/@thienui/ui-patterns/src/ui-patterns.json', 'ui-patterns.json'),
    guardsFile('node_modules/@thienui/tokens/dist/tokens.json', 'tokens.json'),
  ],
});

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'thienui',
  // Registry CÔNG KHAI — homepage phải là URL thật, vì `shadcn add @thienui/x` ở máy người khác
  // sẽ giải địa chỉ từ đây. Xem registry.config.mjs.
  homepage: PUBLIC_URL,
  items,
};

writeFileSync(join(ROOT, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');
mkdirSync(join(ROOT, 'public/r'), { recursive: true });

/**
 * BÁO CÁO phủ demo — cho MỌI item render được, không chỉ patterns/shells.
 *
 * Pha 6 cho thấy một item chưa được render ở đâu có thể mang ba lỗi cùng lúc và vẫn nằm trong
 * registry ở trạng thái "xong". Nên con số này đếm tất cả, và nó in ra tên những cái còn thiếu —
 * một nợ có tên thì trả được, một nợ chỉ là con số thì không.
 *
 * Ba thứ KHÔNG đếm, và lý do phải là lý do thật chứ không phải "khó demo":
 *   · `theme-*` — theme không phải component; chỗ xem nó là trang /tokens.
 *   · `guards`  — một CLI, không render gì; kết quả chạy thật của nó đã hiện ở bảng contrast /tokens.
 *
 * Danh sách này chỉ có ba dòng, và nên giữ nó như vậy. `motion-tokens` từng nằm ở đây với lý do
 * "file dữ liệu sinh tự động" — nhưng nó vẫn là chỗ duy nhất đọc được giá trị thật của tầng cảm
 * giác, nên lý do đó là một cách nói "khó demo" chứ không phải "không demo được".
 */
const KHONG_CAN_DEMO = new Set(['theme-claude', 'theme-slate', 'guards']);
const demoSrc = readFileSync(join(REG, 'demos/index.tsx'), 'utf8');
const coDemo = new Set([...demoSrc.matchAll(/^\s{2}'?([\w-]+)'?:\s*\{/gm)].map((m) => m[1]));
const canDemo = items.map((i) => i.name).filter((n) => !KHONG_CAN_DEMO.has(n));
const thieu = canDemo.filter((n) => !coDemo.has(n));

const byType = items.reduce((a, i) => ((a[i.type] = (a[i.type] ?? 0) + 1), a), {});
console.log(`✓ registry.json: ${items.length} item`);
for (const [t, n] of Object.entries(byType)) console.log(`    ${t.padEnd(20)} ${n}`);
console.log(`    demo                 ${canDemo.length - thieu.length}/${canDemo.length}${thieu.length ? '' : ' ✓'}`);
if (thieu.length) {
  // CỔNG, không phải lời nhắc. Pha 6 cho thấy một item chưa từng được render có thể mang ba lỗi
  // cùng lúc và vẫn nằm trong registry ở trạng thái "xong" — nên "thêm demo sau" là một lời hứa mà
  // chính pha 6 chứng minh là không được giữ. Không demo nổi thì khai vào KHONG_CAN_DEMO kèm lý do
  // thật; "khó demo" không phải lý do.
  console.error(`\n✗ ${thieu.length} item chưa có demo trong registry/demos/index.tsx:`);
  for (const n of thieu) console.error(`    ${n}`);
  process.exit(1);
}
