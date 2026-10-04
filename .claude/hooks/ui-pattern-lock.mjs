#!/usr/bin/env node
/**
 * Hook: hiện TOÀN BỘ luật UI đã khoá trước LẦN GHI UI ĐẦU TIÊN của mỗi phiên.
 *
 * Vì sao là hook chứ không phải một dòng trong AGENTS.md: một luật nằm trong tài liệu chỉ có tác dụng
 * nếu người/agent đọc tài liệu đúng lúc cần. Hook thì chen vào đúng khoảnh khắc trước khi code UI được
 * ghi, nên luật đến vào lúc nó còn thay đổi được quyết định — chứ không phải lúc test đã đỏ.
 *
 * Chỉ bắn MỘT LẦN mỗi phiên, và chỉ khi file bị ghi thật sự là file UI.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UI = /\.(tsx|jsx|css)$/;
const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

let input = '';
process.stdin.setEncoding('utf8');
for await (const c of process.stdin) input += c;

let evt = {};
try { evt = JSON.parse(input || '{}'); } catch { process.exit(0); }

const path = evt?.tool_input?.file_path ?? evt?.tool_input?.path ?? '';
if (!UI.test(path)) process.exit(0);

// Cờ một-lần-mỗi-phiên. Dùng session_id nên hai phiên song song không che nhau.
const stamp = join(ROOT, '.claude', '.cache', `ui-lock-${evt.session_id ?? 'no-session'}`);
if (existsSync(stamp)) process.exit(0);
mkdirSync(join(ROOT, '.claude', '.cache'), { recursive: true });
writeFileSync(stamp, new Date().toISOString());

const reg = join(ROOT, 'packages/ui-patterns/src/ui-patterns.json');
if (!existsSync(reg)) process.exit(0);
const { patterns } = JSON.parse(readFileSync(reg, 'utf8'));

const auto = patterns.filter((p) => p.check.kind !== 'manual');
const manual = patterns.filter((p) => p.check.kind === 'manual');
const line = (p) => `  · [${p.id}] ${p.rule}`;

console.log(
  [
    '',
    `LUẬT UI ĐÃ KHOÁ — ${patterns.length} luật. Đây là lần ghi UI đầu tiên của phiên này.`,
    '',
    `MÁY KIỂM (${auto.length}) — vi phạm sẽ làm đỏ \`pnpm test\`:`,
    ...auto.map(line),
    '',
    `NGƯỜI REVIEW (${manual.length}) — không có cổng, nên phải tự giữ:`,
    ...manual.map(line),
    '',
    'Đọc `why` của một luật trước khi định phá nó: packages/ui-patterns/src/ui-patterns.json',
    'Người dùng sửa một mẫu UI mới? Thêm luật NGAY: skill /ui-pattern-lock',
    '',
  ].join('\n')
);
