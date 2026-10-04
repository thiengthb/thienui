'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Check, X, Minus } from 'lucide-react';
import { cn } from 'cn';
import { useBrandTheme } from '@/components/brand-theme';
import { useMounted } from '@/lib/use-mounted';
import { Badge } from '@/registry/base/badge';
import type { ContrastResult } from '@thienui/guards/contrast';

export type { ContrastResult } from '@thienui/guards/contrast';

/**
 * Bảng đo tương phản, lọc theo theme + mode ĐANG CHỌN.
 *
 * Vì sao phải là client component: kết quả đo được tính ở server (lúc build, bằng @thienui/guards),
 * nhưng theme nào đang hiển thị thì chỉ biết ở client — nó nằm trong localStorage. Nên server tính
 * HẾT 296 cặp rồi truyền xuống, client chỉ lọc. Không có fetch, không có tính lại.
 */
export function ContrastTable({
  results,
  defaultTheme,
}: {
  results: ContrastResult[];
  defaultTheme: string;
}) {
  const { brand } = useBrandTheme();
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Trước khi mount, brand và mode đều chưa biết — render theo theme mặc định/light thay vì đoán,
  // rồi đổi sau khi mount. Số liệu vẫn đúng, chỉ là chưa phải bộ đang xem.
  const theme = mounted ? brand : defaultTheme;
  const mode = mounted ? (resolvedTheme === 'dark' ? 'dark' : 'light') : 'light';

  const rows = results.filter((r) => r.theme === theme && r.mode === mode);
  const fails = rows.filter((r) => !r.pass && !r.allowed);
  const byTier = (t: string) => rows.filter((r) => r.tier === t).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {theme} / {mode}
        </Badge>
        <Badge variant="secondary" className="tabular-nums">
          {rows.length} cặp
        </Badge>
        <Badge variant="secondary" className="tabular-nums">
          {byTier('text')} chữ · {byTier('graphic')} đồ hoạ · {byTier('decor')} decor
        </Badge>
        {fails.length === 0 ? (
          <Badge className="bg-ok-wash text-ok">
            <Check data-icon="inline-start" />
            không cặp nào trượt
          </Badge>
        ) : (
          <Badge variant="destructive" className="tabular-nums">
            <X data-icon="inline-start" />
            {fails.length} trượt
          </Badge>
        )}
      </div>

      {/* Bảng rộng phải tự cuộn ngang trong hộp của nó — thân trang không bao giờ cuộn ngang. */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-xl border-collapse text-footnote">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-2.5 font-medium text-muted-foreground">chữ / phần tử</th>
              <th className="p-2.5 font-medium text-muted-foreground">trên mặt</th>
              <th className="p-2.5 text-right font-medium text-muted-foreground">đo</th>
              <th className="p-2.5 text-right font-medium text-muted-foreground">sàn</th>
              <th className="p-2.5 font-medium text-muted-foreground">bậc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.fg}-${r.bg}`} className="border-b last:border-0">
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ background: `var(--${r.bg})`, color: `var(--${r.fg})` }}
                      className="grid size-6 shrink-0 place-items-center rounded-sm border font-semibold"
                      aria-hidden
                    >
                      Aa
                    </span>
                    <code className="truncate">--{r.fg}</code>
                  </div>
                </td>
                <td className="p-2.5">
                  <code className="truncate text-muted-foreground">--{r.bg}</code>
                </td>
                <td className="p-2.5 text-right tabular-nums">{r.ratio.toFixed(2)}</td>
                <td className="p-2.5 text-right tabular-nums text-muted-foreground">
                  {r.floor ? r.floor.toFixed(1) : <Minus className="ml-auto size-3" aria-label="không có sàn" />}
                </td>
                <td className="p-2.5">
                  <span
                    className={cn(
                      'rounded-sm px-1.5 py-0.5 text-caption2',
                      r.tier === 'text' && 'bg-info-wash text-info',
                      r.tier === 'graphic' && 'bg-warn-wash text-warn',
                      r.tier === 'decor' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {r.tier}
                  </span>
                  {r.allowed ? (
                    <span className="ml-1.5 text-caption2 text-muted-foreground">miễn trừ</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="max-w-prose text-caption1 text-muted-foreground">
        Một cặp trượt thì cách sửa là <strong className="text-foreground">sửa token</strong>, không phải chuyển
        nó xuống bậc thấp hơn cho cổng im tiếng. <code>solveLightness()</code> trong <code>@thienui/guards</code>{' '}
        giải L thay vì mò bằng tay.
      </p>
    </div>
  );
}
