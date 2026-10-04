<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- thienui -->

# Luật của project

Khối trên do `next dev` tự ghi. Luật làm việc của repo nằm ở **`../../AGENTS.md`** (gốc monorepo) —
đọc nó trước khi sửa bất cứ thứ gì trong `registry/`.

Ba điều hay sai nhất ở riêng app này:

- `registry.json` **sinh tự động** từ cây thư mục (`scripts/build-registry.mjs`). Thêm component =
  thêm file vào `registry/<tầng>/`, đừng sửa JSON.
- `turbopack.root` trong `next.config.ts` phải là **gốc repo**, không phải thư mục này. Lý do ghi
  trong chính file đó.
- `app/globals.css`: thứ tự import có ý nghĩa — framework trước, rồi `@thienui/tokens`. Đảo lại thì
  preset của shadcn ghi đè token và cả hệ màu biến mất.
