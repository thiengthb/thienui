import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * `turbopack.root` phải là GỐC MONOREPO, không phải thư mục app.
 *
 * pnpm đặt package thật trong `<gốc repo>/node_modules/.pnpm/...` rồi symlink vào
 * `apps/docs/node_modules`. Turbopack không biên dịch file nằm NGOÀI root, nên:
 *   - để nó tự đoán  -> nó lấy gốc repo (lockfile ở đó) nhưng không lần được symlink
 *   - đặt root = app  -> store rơi ra ngoài root, lỗi y như cũ
 * Chỉ gốc repo mới chứa cả app lẫn store. Lỗi hiện ra là "Could not find the Next.js package",
 * nghe như thiếu cài, trong khi đó là một lỗi về PHẠM VI chứ không phải về cài đặt.
 */
const APP_DIR = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: join(APP_DIR, '..', '..') },
};

export default nextConfig;
