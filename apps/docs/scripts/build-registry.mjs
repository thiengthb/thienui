/**
 * Sinh registry.json từ CÂY THƯ MỤC và từ @thienui/tokens.
 *
 * Vì sao sinh thay vì viết tay: một registry.json viết tay sẽ lệch với thực tế ngay lần thêm component
 * thứ ba — ai cũng quên cập nhật nó, và `shadcn add` thì thất bại với lỗi 404 chứ không nói là thiếu khai.
 * Ở đây cây thư mục LÀ bản khai: thêm một file vào registry/patterns/ là nó tự có mặt trong registry.
 *
 * Bốn tầng, và thứ tự này cũng là thứ tự phụ thuộc được phép:
 *   base/     primitive shadcn trên Base UI — tầng DUY NHẤT được import @base-ui/react
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
  { dir: 'patterns', type: 'registry:component', note: 'generic đã ghép' },
  { dir: 'shells', type: 'registry:component', note: 'khung app' },
  { dir: 'blocks', type: 'registry:block', note: 'cả màn hình' },
];

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
    const deps = new Set();
    for (const m of src.matchAll(/from\s+['"]@\/registry\/(?:base|patterns|shells)\/([\w-]+)['"]/g)) {
      if (m[1] !== name) deps.add(m[1]);
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
const tokens = JSON.parse(readFileSync(join(ROOT, 'node_modules/@thienui/tokens/dist/tokens.json'), 'utf8'));
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
    cssVars: { light: t.light, dark: t.dark },
  });
}

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

const byType = items.reduce((a, i) => ((a[i.type] = (a[i.type] ?? 0) + 1), a), {});
console.log(`✓ registry.json: ${items.length} item`);
for (const [t, n] of Object.entries(byType)) console.log(`    ${t.padEnd(20)} ${n}`);
