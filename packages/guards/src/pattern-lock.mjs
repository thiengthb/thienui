/**
 * Bộ chạy cho LUẬT UI ĐÃ KHOÁ.
 *
 * Ý tưởng gốc từ `docs/ui-patterns.json` + `lib/ui-pattern-lock.test.ts` của sakubun, và nó là tài sản
 * thật của repo đó: một registry chỉ-thêm (append-only) các luật UI mà người dùng KHÔNG BAO GIỜ phải
 * nhắc lại. Mỗi luật mang `rule` (luật là gì) · `why` (vì sao — để sau này không ai gỡ nó vì tưởng vô
 * nghĩa) · `canonical` (chỗ làm đúng, để copy) · `check` (máy chạy được) · `allow` (ngoại lệ KÈM LÝ DO).
 *
 * Hai bên đọc cùng một file: bộ chạy này làm đỏ `pnpm test`, và một hook hiện toàn bộ luật trước lần
 * ghi UI đầu tiên của mỗi phiên. Một luật chỉ có chữ thì là một lời nhắc; có `check` thì là một cổng.
 */
import { readFileSync, globSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_SCOPE = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js', '**/*.css'];
const IGNORE = ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**', '**/*.d.ts'];

/**
 * Khớp glob tối giản cho danh sách loại trừ.
 *
 * `**\/` phải khớp KHÔNG đoạn nào luôn, không chỉ một-hoặc-nhiều: `**\/node_modules/**` phải bắt được
 * `node_modules/pkg/a.tsx` (nằm ngay gốc repo), không chỉ `a/node_modules/pkg/a.tsx`. Dịch nó thành
 * `.*\/` sẽ đòi một dấu gạch đứng trước và bỏ sót đúng trường hợp phổ biến nhất.
 */
function matchSimple(pattern, path) {
  let rx = '';
  let i = 0;
  while (i < pattern.length) {
    if (pattern.startsWith('**/', i)) { rx += '(?:[^/]+/)*'; i += 3; }
    else if (pattern.startsWith('**', i)) { rx += '.*'; i += 2; }
    else if (pattern[i] === '*') { rx += '[^/]*'; i += 1; }
    else { rx += pattern[i].replace(/[.+^${}()|[\]\\?]/, '\\$&'); i += 1; }
  }
  return new RegExp('^' + rx + '$').test(path);
}

/**
 * `exclude` tồn tại vì glob không diễn tả được "mọi nơi TRỪ một thư mục" — và đó là phạm vi đúng của
 * phần lớn luật văn phong: chúng áp cho code TA VIẾT, không áp cho code vendor được kéo lại từ
 * upstream. Không có nó thì mỗi luật phải liệt kê tay từng thư mục được phép, và lần thêm thư mục
 * thứ tư là lần một luật âm thầm ngừng áp.
 */
function filesFor(root, scope, exclude = []) {
  const out = new Set();
  for (const pat of scope) {
    for (const f of globSync(pat, { cwd: root })) {
      if (IGNORE.some((i) => matchSimple(i, f))) continue;
      if (exclude.some((e) => matchSimple(e, f))) continue;
      out.add(f);
    }
  }
  return [...out].sort();
}

/**
 * Chạy một luật. Trả về danh sách vi phạm `{file, line, excerpt}`.
 *
 * `check.kind`:
 *   forbid        — `pattern` KHÔNG được xuất hiện trong phạm vi
 *   require       — `pattern` PHẢI xuất hiện trong mỗi file thuộc phạm vi
 *   forbid-import — file trong `check.from` không được import đường dẫn khớp `check.pattern`
 *
 * `check.exclude` bỏ qua một số glob trong phạm vi — dùng để loại code vendor khỏi luật văn phong.
 */
export function runCheck(root, pattern) {
  const chk = pattern.check;
  if (!chk) return { skipped: 'luật chỉ có chữ, không có check máy chạy được', violations: [] };
  const scope = chk.files ?? DEFAULT_SCOPE;
  const exclude = chk.exclude ?? [];
  const allow = pattern.allow ?? {};
  // Khoá của `allow` là đường dẫn HOẶC glob. Glob cần thiết vì cùng một file sống ở
  // `apps/docs/registry/...` trong thienui nhưng ở `apps/web/registry/...` trong project tiêu thụ —
  // ghi cứng `apps/docs/` thì ngoại lệ không bao giờ khớp ở nơi nó được dùng thật.
  const allowed = (f) => f in allow || Object.keys(allow).some((k) => k.includes('*') && matchSimple(k, f));
  const violations = [];

  if (chk.kind === 'forbid' || chk.kind === 'forbid-import') {
    const rx = new RegExp(chk.pattern);
    const files = filesFor(root, chk.kind === 'forbid-import' ? (chk.from ?? scope) : scope, exclude);
    for (const f of files) {
      if (allowed(f)) continue;
      const lines = readFileSync(resolve(root, f), 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (rx.test(lines[i])) violations.push({ file: f, line: i + 1, excerpt: lines[i].trim().slice(0, 120) });
      }
    }
  } else if (chk.kind === 'require') {
    const rx = new RegExp(chk.pattern);
    for (const f of filesFor(root, scope, exclude)) {
      if (allowed(f)) continue;
      if (!rx.test(readFileSync(resolve(root, f), 'utf8'))) {
        violations.push({ file: f, line: 0, excerpt: 'thiếu mẫu: ' + chk.pattern });
      }
    }
  } else if (chk.kind === 'require-with') {
    // Nếu `when` khớp trong một file thì `then` cũng phải khớp trong file đó.
    const when = new RegExp(chk.when);
    const then = new RegExp(chk.then);
    for (const f of filesFor(root, scope, exclude)) {
      if (allowed(f)) continue;
      const text = readFileSync(resolve(root, f), 'utf8');
      if (when.test(text) && !then.test(text)) {
        violations.push({ file: f, line: 0, excerpt: 'khớp "' + chk.when + '" nhưng thiếu "' + chk.then + '"' });
      }
    }
  } else if (chk.kind === 'manual') {
    // Luật người review, không máy. Vẫn nằm trong registry vì hook phải HIỆN nó ra trước khi ghi UI —
    // và vì `why` của nó là thứ ngăn người sau gỡ luật vì tưởng nó vô nghĩa.
    return { manual: true, violations: [] };
  } else {
    return { error: 'check.kind không biết: ' + chk.kind, violations: [] };
  }
  return { violations };
}

/** Chạy cả registry. Trả về { pass, byPattern, total }. */
export function runPatternLock(root, registry) {
  const byPattern = [];
  let total = 0;
  for (const p of registry.patterns) {
    const r = runCheck(root, p);
    total += r.violations.length;
    byPattern.push({ id: p.id, rule: p.rule, canonical: p.canonical, ...r });
  }
  return { pass: total === 0, byPattern, total };
}

export const loadRegistry = (file) => JSON.parse(readFileSync(file, 'utf8'));
