/**
 * @thienui/tokens — build.
 *
 * Đọc tầng 1 (primitive.json, scale.json) + tầng 2 (semantic.*.json) rồi sinh ra:
 *   dist/tokens.css   — cả ba tầng, GIỮ NGUYÊN indirection var() để devtools thấy được chuỗi tham chiếu
 *   dist/base.css     — lớp nền: reset viền/ring, scrollbar theo theme, prefers-reduced-motion, focus ring
 *   dist/tokens.ts    — bản đã resolve, có kiểu, cho test và cho code đọc token ở runtime
 *   dist/themes.json   — danh sách theme, cho trang docs và cho registry:theme
 *
 * Vì sao giữ var() thay vì inline giá trị đã resolve: để một consumer ghi đè MỘT token tầng 1 là cả
 * tầng 2 đi theo. Inline giá trị thì tầng 1 biến mất lúc runtime và ba tầng chỉ còn là chuyện của build.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

const read = (f) => JSON.parse(readFileSync(join(SRC, f), 'utf8'));
const primitive = read('primitive.json');
const scale = read('scale.json');

/** Làm phẳng cây DTCG thành `a.b.c` -> $value, bỏ mọi khoá $meta. */
function flatten(node, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && '$value' in v) out[path] = v.$value;
    else if (v && typeof v === 'object') flatten(v, path, out);
  }
  return out;
}

const P = { ...flatten(primitive), ...flatten(scale) };

/** `a.b.c` -> tên CSS var của tầng 1. Tiền tố `p-` để không ai nhầm nó với token tầng 2. */
const pvar = (path) => `--p-${path.replace(/^color\./, '').replace(/\./g, '-')}`;

/** Đổi [x1,y1,x2,y2] thành cubic-bezier(), số thì để nguyên, object (spring) thì JSON. */
function cssValue(v) {
  if (Array.isArray(v)) return `cubic-bezier(${v.join(', ')})`;
  if (v && typeof v === 'object') return null; // spring — chỉ xuất sang TS
  return String(v);
}

const themes = readdirSync(SRC)
  .filter((f) => f.startsWith('semantic.') && f.endsWith('.json'))
  .map((f) => read(f));
const def = themes.find((t) => t.$default) ?? themes[0];

/* ───────────────────── cổng: luật một chiều ───────────────────── */
const errors = [];
for (const t of themes) {
  for (const mode of ['light', 'dark']) {
    for (const [name, ref] of Object.entries(t[mode])) {
      const m = /^\{([^}]+)\}$/.exec(ref);
      if (!m) {
        errors.push(`[${t.$theme}.${mode}] --${name} giữ literal "${ref}" — tầng 2 chỉ được TRỎ tới tầng 1.`);
        continue;
      }
      if (!(m[1] in P)) errors.push(`[${t.$theme}.${mode}] --${name} trỏ tới "${m[1]}" không tồn tại ở tầng 1.`);
    }
  }
}
const names = themes.map((t) => new Set(Object.keys(t.light)));
for (let i = 1; i < themes.length; i++) {
  for (const n of names[0]) if (!names[i].has(n)) errors.push(`[${themes[i].$theme}] thiếu token "--${n}" mà theme "${themes[0].$theme}" có.`);
  for (const n of names[i]) if (!names[0].has(n)) errors.push(`[${themes[i].$theme}] có token lạ "--${n}" không theme nào khác có.`);
}
for (const t of themes) {
  const l = new Set(Object.keys(t.light)), d = new Set(Object.keys(t.dark));
  for (const n of l) if (!d.has(n)) errors.push(`[${t.$theme}] "--${n}" có ở light mà thiếu ở dark.`);
  for (const n of d) if (!l.has(n)) errors.push(`[${t.$theme}] "--${n}" có ở dark mà thiếu ở light.`);
}
if (errors.length) {
  console.error('\n✗ token build DỪNG — ' + errors.length + ' vi phạm:\n');
  for (const e of errors) console.error('  ' + e);
  console.error('');
  process.exit(1);
}

/* ───────────────────── sinh CSS ───────────────────── */
/** Khối tầng 1 cho một mode: mọi ramp màu ở mode đó + (chỉ ở light) các token phi-màu. */
function tier1Block(mode, includeStatic) {
  const lines = [];
  for (const [path, v] of Object.entries(P)) {
    if (!path.startsWith('color.')) continue;
    const seg = path.split('.');
    if (seg[2] !== mode) continue;
    lines.push(`  ${pvar(`${seg[1]}.${seg[3]}`)}: ${v};`);
  }
  // elevation phụ thuộc mode
  for (const [path, v] of Object.entries(P)) {
    if (!path.startsWith(`elevation.${mode}.`)) continue;
    lines.push(`  --p-elevation-${path.split('.')[2]}: ${v};`);
  }
  if (!includeStatic) return lines;
  const statics = [];
  for (const [path, v] of Object.entries(P)) {
    if (path.startsWith('color.') || path.startsWith('elevation.')) continue;
    const cv = cssValue(v);
    if (cv === null) continue;
    statics.push(`  --p-${path.replace(/\./g, '-')}: ${cv};`);
  }
  return [...lines, '', '  /* phi-màu — không phụ thuộc mode */', ...statics];
}

/**
 * Khối tầng 2 cho một theme+mode: mỗi token là một var() trỏ về tầng 1.
 *
 * Đoạn `mode` bị BỎ khi dựng tên var: tầng 1 khai `--p-warm-1` một lần trong mỗi khối (`:root` giữ
 * giá trị light, `.dark` ghi đè bằng giá trị dark), nên tầng 2 chỉ cần trỏ `var(--p-warm-1)` và nó tự
 * đúng ở cả hai mode. Giữ lại `mode` trong tên sẽ sinh ra `--p-warm-light-1` — một var không ai khai,
 * và vì CSS không báo lỗi var thiếu, cả theme sẽ render rỗng mà không có triệu chứng nào.
 */
function tier2Block(theme, mode) {
  return Object.entries(theme[mode]).map(([name, ref]) => {
    const path = /^\{([^}]+)\}$/.exec(ref)[1];
    const seg = path.split('.');
    const v = path.startsWith('elevation.')
      ? `var(--p-elevation-${seg[2]})`
      : `var(${pvar(`${seg[1]}.${seg[3]}`)})`;
    return `  --${name}: ${v};`;
  });
}

const H = (s) => `  /* ── ${s} ── */`;
const out = [];
out.push('/* SINH TỰ ĐỘNG bởi @thienui/tokens — ĐỪNG SỬA TAY.');
out.push(' * Nguồn: src/primitive.json · src/scale.json · src/semantic.*.json');
out.push(' * Sửa token = sửa file nguồn rồi chạy `pnpm --filter @thienui/tokens build`.');
out.push(' *');
out.push(' * File này KHÔNG import tailwindcss / tw-animate-css / shadcn — đó là việc của app, không phải');
out.push(" * của package token. Trộn vào đây sẽ buộc mọi consumer dùng đúng bộ import của ta, và sẽ nạp");
out.push(' * framework hai lần nếu app đã tự import. */');
out.push('');
out.push('@custom-variant dark (&:is(.dark *));');
out.push('');

const blocks = [];
blocks.push({ sel: ':root', theme: def, mode: 'light', statics: true, note: `theme mặc định "${def.$theme}" · light` });
blocks.push({ sel: '.dark', theme: def, mode: 'dark', statics: false, note: `theme mặc định "${def.$theme}" · dark` });
for (const t of themes) {
  blocks.push({ sel: `[data-theme='${t.$theme}']`, theme: t, mode: 'light', statics: false, note: `${t.$label} · light` });
  blocks.push({ sel: `[data-theme='${t.$theme}'].dark`, theme: t, mode: 'dark', statics: false, note: `${t.$label} · dark` });
}
for (const b of blocks) {
  out.push(`/* ${b.note} */`);
  out.push(`${b.sel} {`);
  out.push(H('TẦNG 1 · primitive'));
  out.push(...tier1Block(b.mode, b.statics));
  out.push('');
  out.push(H('TẦNG 2 · semantic — tên do shadcn quy định'));
  out.push(...tier2Block(b.theme, b.mode));
  if (b.statics) {
    out.push('');
    out.push(H('TẦNG 3 · component — chỉ tạo khi thật cần'));
    out.push('  --btn-primary-bg: var(--primary);');
    out.push('  --btn-primary-bg-hover: color-mix(in oklch, var(--primary) 88%, black);');
    out.push('  --btn-primary-bg-active: color-mix(in oklch, var(--primary) 78%, black);');
    out.push('  --ring-width: 2px;');
    out.push('  --ring-offset: 2px;');
    out.push('');
    out.push(H('bán kính ĐỒNG TÂM — r_trong = r_ngoài − padding'));
    out.push('  /* Chỗ dùng chỉ cần khai --pad; đừng khai lại công thức. */');
    out.push('  --radius-concentric: max(0px, calc(var(--radius-outer, var(--p-radius-lg)) - var(--pad, 0px)));');
    out.push('');
    out.push(H('alias ngắn cho chỗ dùng quen tay'));
    out.push('  --radius: var(--p-radius-base);');
  }
  out.push('}');
  out.push('');
}

out.push('/* Nối tầng 2 vào Tailwind v4. Chỉ ở đây token gặp utility class. */');
out.push('@theme inline {');
for (const name of Object.keys(def.light)) {
  if (name.startsWith('shadow-')) out.push(`  --shadow-${name.slice(7)}: var(--${name});`);
  else out.push(`  --color-${name}: var(--${name});`);
}
out.push('');
for (const [path, v] of Object.entries(P)) {
  if (path.startsWith('type.')) out.push(`  --text-${path.slice(5)}: var(--p-${path.replace(/\./g, '-')});`);
}
for (const [path] of Object.entries(P)) {
  if (path.startsWith('radius.')) {
    const k = path.slice(7);
    out.push(`  --radius-${k}: var(--p-radius-${k});`);
  }
}
out.push('  --font-sans: var(--font-sans);');
out.push('  --font-mono: var(--font-mono);');
out.push('}');
out.push('');

/* ───────────────────── cổng: mọi var() phải có người khai ─────────────────────
 * CSS KHÔNG báo lỗi khi một var() trỏ vào biến không tồn tại — nó chỉ im lặng trả rỗng, và cả theme
 * render sai mà không có một triệu chứng nào. Đúng lỗi đó đã xảy ra một lần trong lúc dựng package này
 * (`--p-warm-light-1` thay vì `--p-warm-1`), nên nó thành một cổng chứ không thành một dòng chú thích.
 * Luật: mỗi khối phải tự khai đủ var tầng 1 mà tầng 2 của nó dùng, hoặc var đó phải có trong `:root`. */
const css = out.join('\n');
const rootDeclared = new Set();
{
  const m = /^:root \{([\s\S]*?)^\}/m.exec(css);
  for (const d of m[1].matchAll(/^\s*(--[\w-]+)\s*:/gm)) rootDeclared.add(d[1]);
}
const varErrors = [];
for (const blk of css.matchAll(/^(\S[^{\n]*) \{\n([\s\S]*?)^\}/gm)) {
  const [, sel, body] = blk;
  if (sel.startsWith('@')) continue;
  const declared = new Set([...body.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((d) => d[1]));
  for (const u of body.matchAll(/var\((--p-[\w-]+)/g)) {
    if (!declared.has(u[1]) && !rootDeclared.has(u[1])) varErrors.push(`${sel.trim()} dùng var(${u[1]}) nhưng không khối nào khai nó`);
  }
}
if (varErrors.length) {
  console.error('\n✗ token build DỪNG — ' + varErrors.length + ' var() không có người khai:\n');
  for (const e of [...new Set(varErrors)].slice(0, 20)) console.error('  ' + e);
  console.error('');
  process.exit(1);
}

mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, 'tokens.css'), css);

/* ───────────────────── base.css ───────────────────── */
writeFileSync(join(DIST, 'base.css'), `/* SINH TỰ ĐỘNG bởi @thienui/tokens — ĐỪNG SỬA TAY. */
@layer base {
  * { border-color: var(--border); }
  body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }

  /* Focus ring ĐƯỢC THIẾT KẾ, không để mặc định browser. :focus-visible nên nó chỉ hiện khi
     điều hướng bằng bàn phím. Hai lớp ring để nó đọc được trên cả nền sáng và nền đặc. */
  :focus-visible {
    outline: var(--ring-width) solid var(--ring);
    outline-offset: var(--ring-offset);
  }

  /* Vùng chạm 44px mà KHÔNG phóng to phần nhìn thấy — hit-area overflow. */
  .target-44 { position: relative; }
  .target-44::after {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    translate: -50% -50%;
    min-width: var(--p-target-min);
    min-height: var(--p-target-min);
    width: 100%;
    height: 100%;
  }

  /* Số thẳng cột ở mọi nơi chữ số xếp cột. */
  .tnum { font-variant-numeric: tabular-nums; }

  /* Scrollbar theo theme (chuẩn + fallback webkit). */
  * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  @supports selector(::-webkit-scrollbar) {
    *::-webkit-scrollbar { width: 8px; height: 8px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { background: var(--border); border-radius: var(--p-radius-full); }
    *::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
  }

  /* Luật TOÀN CỤC, và lý do mọi animation phải viết bằng CSS keyframe chứ không bằng JS:
     luật này không chạm tới được animation do JS điều khiển. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
`);

/* ───────────────────── tokens.ts ───────────────────── */
const resolved = Object.fromEntries(
  themes.map((t) => [
    t.$theme,
    Object.fromEntries(
      ['light', 'dark'].map((m) => [
        m,
        Object.fromEntries(Object.entries(t[m]).map(([n, r]) => [n, P[/^\{([^}]+)\}$/.exec(r)[1]]])),
      ])
    ),
  ])
);
writeFileSync(
  join(DIST, 'tokens.ts'),
  `// SINH TỰ ĐỘNG bởi @thienui/tokens — ĐỪNG SỬA TAY.
export const primitive = ${JSON.stringify(P, null, 2)} as const;
export const themes = ${JSON.stringify(resolved, null, 2)} as const;
export const themeMeta = ${JSON.stringify(
    themes.map((t) => ({ name: t.$theme, label: t.$label, default: !!t.$default })),
    null,
    2
  )} as const;
export type ThemeName = keyof typeof themes;
export type Mode = 'light' | 'dark';
export type SemanticToken = keyof (typeof themes)['${def.$theme}']['light'];
`
);
/* Bản JSON của tầng 1 + tầng 2 đã resolve. @thienui/guards đọc FILE NÀY, không parse CSS.
 * Lý do: cổng contrast của sakubun đọc globals.css theo TỪNG DÒNG, nên một lần `prettier --write`
 * gấp một dòng khai token thành ba đã làm 4 ca đỏ với `TypeError: reading 'startsWith'`. Một cổng
 * mà format code làm vỡ được thì không phải cổng. */
writeFileSync(
  join(DIST, 'tokens.json'),
  JSON.stringify({ primitive: P, themes: resolved, meta: themes.map((t) => ({ name: t.$theme, label: t.$label, default: !!t.$default })) }, null, 2)
);
writeFileSync(
  join(DIST, 'themes.json'),
  JSON.stringify(themes.map((t) => ({ name: t.$theme, label: t.$label, default: !!t.$default })), null, 2)
);

const n = Object.keys(def.light).length;
console.log(`✓ tokens: ${Object.keys(P).length} primitive · ${n} semantic × ${themes.length} theme × 2 mode`);
console.log(`  dist/tokens.css · dist/base.css · dist/tokens.ts · dist/tokens.json · dist/themes.json`);
