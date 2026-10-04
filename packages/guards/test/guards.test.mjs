import { describe, expect, it } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { contrast, solveLightness, outOfGamut } from '../src/oklch.mjs';
import { checkContrast, checkGamut, POLICY } from '../src/contrast.mjs';
import { runCheck, runPatternLock } from '../src/pattern-lock.mjs';

const tokens = JSON.parse(readFileSync(new URL('../../tokens/dist/tokens.json', import.meta.url), 'utf8'));
const registry = JSON.parse(readFileSync(new URL('../../ui-patterns/src/ui-patterns.json', import.meta.url), 'utf8'));

describe('toán OKLCH', () => {
  it('khớp các tỉ số sakubun đã đo bằng tay', () => {
    // Hai con số này nằm trong comment của app/globals.css ở sakubun. Nếu port sai thì chúng lệch.
    expect(contrast('oklch(1 0 95)', 'oklch(0.672 0.131 39)')).toBeCloseTo(3.12, 1);
    expect(contrast('oklch(0.191 0.002 107)', 'oklch(0.672 0.131 39)')).toBeCloseTo(5.89, 1);
  });

  it('tương phản có tính đối xứng', () => {
    const a = 'oklch(0.2 0.01 100)', b = 'oklch(0.9 0.01 100)';
    expect(contrast(a, b)).toBeCloseTo(contrast(b, a), 10);
  });

  it('cùng một màu thì tỉ số là 1', () => {
    expect(contrast('oklch(0.5 0.1 200)', 'oklch(0.5 0.1 200)')).toBeCloseTo(1, 10);
  });

  it('solveLightness trả về L thực sự đạt ngưỡng', () => {
    const grounds = ['oklch(0.982 0.005 95)', 'oklch(1 0 95)'];
    const L = solveLightness(0.13, 39, grounds, 4.5, { prefer: 'light' });
    expect(L).toBeGreaterThan(0);
    for (const g of grounds) expect(contrast(`oklch(${L} 0.13 39)`, g)).toBeGreaterThanOrEqual(4.5);
  });

  it('phát hiện màu ngoài gamut sRGB', () => {
    expect(outOfGamut('oklch(0.6 0.4 150)')).toBe(true); // chroma bất khả thi
    expect(outOfGamut('oklch(0.672 0.131 39)')).toBe(false);
  });

  it('từ chối giá trị không phải oklch()', () => {
    expect(() => contrast('#ff0000', 'oklch(1 0 0)')).toThrow(/oklch/);
  });
});

describe('cổng contrast trên token thật', () => {
  const r = checkContrast(tokens);

  it('mọi theme × mode đạt sàn WCAG', () => {
    const msg = r.failures
      .map((f) => `${f.theme}/${f.mode} --${f.fg} trên --${f.bg}: ${f.ratio} < ${f.floor}`)
      .join('\n');
    expect(msg).toBe('');
    expect(r.pass).toBe(true);
  });

  it('phủ cả hai theme và cả hai mode', () => {
    const combos = new Set(r.results.map((x) => `${x.theme}/${x.mode}`));
    expect([...combos].sort()).toEqual(['claude/dark', 'claude/light', 'slate/dark', 'slate/light']);
  });

  it('không token nào ngoài gamut sRGB', () => {
    const g = checkGamut(tokens);
    expect(g.outOfGamut.map((b) => `${b.path}=${b.value}`)).toEqual([]);
  });

  it('mọi token trong POLICY đều tồn tại trong mọi theme', () => {
    const needed = new Set(POLICY.flatMap((p) => [p.token, ...p.on]));
    const missing = [];
    for (const [theme, modes] of Object.entries(tokens.themes))
      for (const [mode, t] of Object.entries(modes))
        for (const n of needed) if (!(n in t)) missing.push(`${theme}/${mode}: --${n}`);
    expect(missing).toEqual([]);
  });

  it('bật một token sai thì cổng PHẢI đỏ — cổng không được mù', () => {
    const broken = structuredClone(tokens);
    broken.themes.claude.light['muted-foreground'] = 'oklch(0.9 0.008 97)'; // quá sáng trên trang kem
    const br = checkContrast(broken);
    expect(br.pass).toBe(false);
    expect(br.failures.some((f) => f.fg === 'muted-foreground')).toBe(true);
  });

  it('miễn trừ phải KÈM LÝ DO, không được là chuỗi rỗng', () => {
    const allowed = r.results.filter((x) => x.allowed);
    for (const a of allowed) expect(String(a.allowed).length).toBeGreaterThan(40);
  });
});

describe('registry luật UI', () => {
  it('mỗi luật có id · rule · why · check', () => {
    for (const p of registry.patterns) {
      expect(p.id, JSON.stringify(p).slice(0, 80)).toBeTruthy();
      expect(p.rule, p.id).toBeTruthy();
      expect(p.why, `luật "${p.id}" thiếu why — luật không có lý do sẽ bị gỡ`).toBeTruthy();
      expect(p.check, p.id).toBeTruthy();
    }
  });

  it('id không trùng nhau', () => {
    const ids = registry.patterns.map((p) => p.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('mọi regex compile được', () => {
    for (const p of registry.patterns) {
      for (const k of ['pattern', 'when', 'then']) {
        if (p.check[k]) expect(() => new RegExp(p.check[k]), `${p.id}.${k}`).not.toThrow();
      }
    }
  });

  it('mọi ngoại lệ allow phải kèm lý do', () => {
    for (const p of registry.patterns)
      for (const [file, reason] of Object.entries(p.allow ?? {}))
        expect(String(reason).length, `${p.id} → ${file}`).toBeGreaterThan(20);
  });

  it('check.kind chỉ nằm trong tập bộ chạy hiểu được', () => {
    const known = new Set(['forbid', 'require', 'forbid-import', 'require-with', 'manual']);
    for (const p of registry.patterns) expect(known.has(p.check.kind), `${p.id}: ${p.check.kind}`).toBe(true);
  });
});

describe('bộ chạy pattern-lock', () => {
  /** Dựng một repo giả rồi quét, để kiểm chính BỘ CHẠY chứ không kiểm repo này. */
  function fixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'thienui-lock-'));
    for (const [p, content] of Object.entries(files)) {
      const full = join(dir, p);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, content);
    }
    return dir;
  }

  it('forbid bắt được vi phạm và báo đúng số dòng', () => {
    const dir = fixture({ 'a.tsx': 'const x = 1;\nconst c = "#ff00aa";\n' });
    const r = runCheck(dir, { id: 't', check: { kind: 'forbid', pattern: '#[0-9a-fA-F]{6}\\b' } });
    expect(r.violations).toHaveLength(1);
    expect(r.violations[0]).toMatchObject({ file: 'a.tsx', line: 2 });
  });

  it('allow miễn trừ đúng file được nêu, và chỉ file đó', () => {
    const files = { 'ok.tsx': 'const c = "#ff00aa";\n', 'bad.tsx': 'const c = "#ff00aa";\n' };
    const dir = fixture(files);
    const r = runCheck(dir, {
      id: 't',
      check: { kind: 'forbid', pattern: '#[0-9a-fA-F]{6}\\b' },
      allow: { 'ok.tsx': 'lý do đủ dài để qua test về lý do' },
    });
    expect(r.violations.map((v) => v.file)).toEqual(['bad.tsx']);
  });

  it('bỏ qua node_modules và dist', () => {
    const dir = fixture({
      'node_modules/pkg/i.tsx': 'const c = "#ff00aa";\n',
      'dist/out.tsx': 'const c = "#ff00aa";\n',
      'src/real.tsx': 'const c = "#ff00aa";\n',
    });
    const r = runCheck(dir, { id: 't', check: { kind: 'forbid', pattern: '#[0-9a-fA-F]{6}\\b' } });
    expect(r.violations.map((v) => v.file)).toEqual(['src/real.tsx']);
  });

  it('forbid-import chỉ quét phạm vi `from`', () => {
    const dir = fixture({
      'base/b.tsx': "import { X } from '@base-ui-components/react';\n",
      'patterns/p.tsx': "import { X } from '@base-ui-components/react';\n",
    });
    const r = runCheck(dir, {
      id: 't',
      check: { kind: 'forbid-import', pattern: "from\\s+['\"]@base-ui-components/", from: ['patterns/**/*.tsx'] },
    });
    expect(r.violations.map((v) => v.file)).toEqual(['patterns/p.tsx']);
  });

  it('require-with chỉ đòi `then` ở file có `when`', () => {
    const dir = fixture({
      'has.tsx': 'export function BulkDeleteButton() {}\n',
      'ok.tsx': 'export function BulkDeleteButton() { return <BulkActionButton/>; }\n',
      'other.tsx': 'export function Plain() {}\n',
    });
    const r = runCheck(dir, {
      id: 't',
      check: { kind: 'require-with', when: 'export function Bulk\\w+Button', then: 'BulkActionButton' },
    });
    expect(r.violations.map((v) => v.file)).toEqual(['has.tsx']);
  });

  it('manual không bao giờ sinh vi phạm nhưng được đánh dấu là manual', () => {
    const dir = fixture({ 'a.tsx': 'bất kỳ\n' });
    const r = runCheck(dir, { id: 't', check: { kind: 'manual' } });
    expect(r.manual).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('kind lạ thì báo lỗi cấu hình, không im lặng pass', () => {
    const dir = fixture({ 'a.tsx': 'x\n' });
    const r = runCheck(dir, { id: 't', check: { kind: 'khong-ton-tai' } });
    expect(r.error).toMatch(/không biết/);
  });

  it('exclude loại đúng glob được nêu, phần còn lại vẫn bị quét', () => {
    const dir = fixture({
      'apps/docs/registry/base/vendor.tsx': 'const c = "#ff00aa";\n',
      'apps/docs/registry/patterns/mine.tsx': 'const c = "#ff00aa";\n',
    });
    const r = runCheck(dir, {
      id: 't',
      check: { kind: 'forbid', pattern: '#[0-9a-fA-F]{6}\\b', exclude: ['apps/*/registry/base/**'] },
    });
    expect(r.violations.map((v) => v.file)).toEqual(['apps/docs/registry/patterns/mine.tsx']);
  });

  it('7 luật đã scope khỏi vendor VẪN bắt được vi phạm trong code ta viết', () => {
    // Hẹp phạm vi một luật là chỗ dễ làm nó mù nhất: nó vẫn chạy, vẫn báo xanh, và không còn kiểm gì.
    // Ca này dựng một file trong `patterns/` phạm đúng 7 luật đó và đòi cả 7 phải đỏ.
    const dir = fixture({
      'apps/docs/registry/patterns/bad.tsx': [
        'export function Bad() {',
        '  return (',
        '    <div className="backdrop-blur-sm rounded-[7px] duration-[0.35s] focus:outline-none">',
        '      <svg viewBox="0 0 24 24" />',
        '      <input type="text" title="gõ vào đây" />',
        '    </div>',
        '  );',
        '}',
      ].join('\n'),
    });
    const r = runPatternLock(dir, registry);
    const fired = new Set(r.byPattern.filter((p) => p.violations.length).map((p) => p.id));
    for (const id of [
      'lucide-icons-only',
      'no-arbitrary-scale-values',
      'no-raw-durations',
      'focus-visible-never-removed',
      'glass-only-on-chrome',
      'input-clear-affordance',
      'explain-is-the-only-tooltip',
    ]) {
      expect(fired.has(id), `luật "${id}" KHÔNG đỏ — scope đã làm nó mù`).toBe(true);
    }
  });

  it('cùng file đó đặt trong registry/base/ thì 7 luật kia im, luật MÀU thì không', () => {
    const dir = fixture({
      'apps/docs/registry/base/vendor.tsx': [
        'export function V() {',
        '  return <div className="rounded-[7px] duration-[0.35s]" style={{ color: "#ff00aa" }} />;',
        '}',
      ].join('\n'),
    });
    const r = runPatternLock(dir, registry);
    const fired = new Set(r.byPattern.filter((p) => p.violations.length).map((p) => p.id));
    expect(fired.has('no-arbitrary-scale-values')).toBe(false);
    expect(fired.has('no-raw-durations')).toBe(false);
    // Màu là thứ quyết định theme có chạy không, nên nó áp khắp nơi kể cả code vendor.
    expect(fired.has('no-hardcoded-colors'), 'luật màu PHẢI áp cả trong vendor').toBe(true);
  });

  it('runPatternLock chạy được cả registry thật trên một repo sạch', () => {
    const dir = fixture({ 'src/clean.tsx': 'export const A = () => <div className="bg-card" />;\n' });
    const r = runPatternLock(dir, registry);
    const msg = r.byPattern
      .filter((p) => p.violations.length)
      .map((p) => `${p.id}: ${p.violations.map((v) => v.file + ':' + v.line).join(', ')}`)
      .join('\n');
    expect(msg).toBe('');
  });
});
