import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

/**
 * Đọc cây `registry/` làm chỉ mục cho trang showcase.
 *
 * Đọc THƯ MỤC chứ không đọc `registry.json`: file đó là ĐẦU RA của `scripts/build-registry.mjs`, nên
 * đọc nó sẽ làm trang showcase phụ thuộc vào thứ tự chạy của hai script — thêm một component rồi mở
 * trang mà chưa build registry thì nó biến mất, và không có lỗi nào giải thích tại sao.
 */
export type Tier = 'base' | 'lib' | 'patterns' | 'shells' | 'blocks';

export const TIER_LABEL: Record<Tier, { label: string; note: string }> = {
  base: {
    label: 'Primitive',
    note: 'Tầng DUY NHẤT được import @base-ui/react. Code vendor — shadcn add ghi đè nó.',
  },
  lib: {
    label: 'Lib',
    note: 'Thư viện dùng chung, không phải component: tầng cảm giác (spring, độ sâu, press depth).',
  },
  patterns: {
    label: 'Pattern',
    note: 'Generic đã ghép, không dính nghiệp vụ: data-table, confirm-dialog, empty-state.',
  },
  shells: { label: 'Shell', note: 'Khung app và layout.' },
  blocks: { label: 'Block', note: 'Cả một màn hình.' },
};

export type Item = { name: string; tier: Tier; isHook: boolean; file: string };

const ROOT = process.cwd();

export function listRegistry(): Item[] {
  const out: Item[] = [];
  for (const tier of Object.keys(TIER_LABEL) as Tier[]) {
    const dir = join(ROOT, 'registry', tier);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) {
      if (!['.tsx', '.ts'].includes(extname(f)) || f.startsWith('_')) continue;
      const name = basename(f, extname(f));
      out.push({ name, tier, isHook: extname(f) === '.ts' && name.startsWith('use-'), file: `registry/${tier}/${f}` });
    }
  }
  return out;
}

export const findItem = (name: string) => listRegistry().find((i) => i.name === name);

export function readSource(item: Item): string {
  return readFileSync(join(ROOT, item.file), 'utf8');
}

/** Tên export dạng PascalCase mà một file registry cung cấp — để trang component biết render gì. */
export function exportNames(src: string): string[] {
  const m = /export\s*\{([^}]*)\}/g;
  const names = new Set<string>();
  for (const block of src.matchAll(m)) {
    for (const raw of block[1]!.split(',')) {
      const n = raw.trim().split(/\s+as\s+/).pop()?.trim();
      if (n && /^[A-Z]/.test(n)) names.add(n);
    }
  }
  return [...names];
}
