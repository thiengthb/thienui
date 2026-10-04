/**
 * Địa chỉ công khai của registry thienui. MỘT CHỖ DUY NHẤT.
 *
 * Quyết định 2026-10-04: registry **công khai**. Lý do: nó miễn phí, được có mặt trong chỉ mục 418
 * nguồn của shadcn, và không có gì bí mật trong một tầng UI. (Nếu sau này cần private: shadcn hỗ trợ
 * GitHub private qua `gh` CLI từ 08/2026, và `components.json` nhận header `${ENV}`.)
 *
 * URL phải khớp ở ba nơi, nên nó sống ở đây chứ không rải ra: `registry.json` (homepage),
 * `components.json` (namespace `@thienui`), và README.
 *
 * CHƯA DEPLOY. Đổi `PUBLIC_URL` khi đã chọn domain, rồi `pnpm registry:build` — hoặc đặt biến
 * môi trường `THIENUI_REGISTRY_URL` để ghi đè mà không sửa file.
 */
export const PUBLIC_URL = process.env.THIENUI_REGISTRY_URL ?? 'https://thienui.vercel.app';
export const DEV_URL = 'http://localhost:4321';

/** Dev thì trỏ localhost để sửa component xong là `shadcn add` lấy được ngay, không cần deploy. */
export const REGISTRY_URL = process.env.NODE_ENV === 'production' ? PUBLIC_URL : DEV_URL;
