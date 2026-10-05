'use client';

/**
 * Demo cho `motion-tokens` — file DỮ LIỆU, không phải component.
 *
 * Nó vẫn đáng có một trang, vì đây là chỗ duy nhất đọc được giá trị THẬT của tầng cảm giác dưới dạng
 * số. `lib/motion.ts` dẫn xuất mọi thứ từ bảng này; CSS thì nhận bản đã resolve qua theme.
 *
 * File được SINH TỰ ĐỘNG bởi `scripts/build-registry.mjs` từ `@thienui/tokens`. Nó tồn tại vì
 * `motion.ts` cần spring dưới dạng SỐ (stiffness, damping) mà CSS không mang được — và vì khai một
 * dependency npm chưa publish làm `shadcn add` chết cả lô ở project ngoài (pha 6, MS-04).
 */
import { primitive } from '@/registry/lib/motion-tokens';

const nhom = (tien: string) =>
  Object.entries(primitive).filter(([k]) => k.startsWith(tien)) as [string, string][];

function Bang({ tieuDe, tien, ghiChu }: { tieuDe: string; tien: string; ghiChu: string }) {
  const hang = nhom(tien);
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-subhead font-semibold">
        {tieuDe} <span className="text-caption1 font-normal text-muted-foreground">({hang.length})</span>
      </h3>
      <p className="max-w-prose text-caption1 text-muted-foreground">{ghiChu}</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-caption1">
          <tbody>
            {hang.map(([k, v]) => (
              <tr key={k} className="border-b last:border-0">
                <td className="p-2.5">
                  <code>{k.slice(tien.length)}</code>
                </td>
                <td className="p-2.5 text-right">
                  <code className="text-muted-foreground tabular-nums">
                    {typeof v === 'string' ? v : JSON.stringify(v)}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function MotionTokensDemo() {
  return (
    <div className="flex flex-col gap-8">
      <Bang
        tieuDe="Thời lượng"
        tien="motion.duration."
        ghiChu="Tailwind KHÔNG có namespace cho duration — `duration-*` đọc thang riêng của nó. Nên cách đúng để dùng token thời lượng là giá trị tuỳ ý TRỎ TOKEN: duration-[var(--p-motion-duration-fast)]. Luật no-raw-durations cho phép đúng dạng đó."
      />
      <Bang
        tieuDe="Easing"
        tien="motion.easing."
        ghiChu="Năm đường cong, không nhiều hơn. `decelerate` là cái duy nhất được thêm khi vay @seamui/motion ở pha 5 — easing `surface` của họ đo được cách `overshoot` của ta 0.11 trong không gian control point, tức cùng một ý đồ, nên nó được ÁNH XẠ VÀO thay vì thêm một token trùng nghĩa."
      />
      <Bang
        tieuDe="Spring"
        tien="motion.spring."
        ghiChu="Bốn tính cách × bốn vai trò. Spring là SỐ, không phải CSS — đó là lý do file này tồn tại, và là lý do nó không thể đi qua theme như mọi token khác."
      />
    </div>
  );
}
