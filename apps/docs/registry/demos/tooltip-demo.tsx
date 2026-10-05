'use client';

/**
 * Demo của chính primitive `tooltip`.
 *
 * File RIÊNG, và đó là cả lý do nó tồn tại. Luật `explain-is-the-only-tooltip` cấm dựng Tooltip
 * primitive trực tiếp ở ngoài `registry/patterns` — nhưng demo của một primitive là chỗ **duy nhất**
 * bắt buộc phải dựng nó trực tiếp. Nên ngoại lệ được khoanh vào đúng một đường dẫn trong `check.exclude`,
 * thay vì mở cho cả thư mục demos: mọi file demo khác vẫn phải đi qua `Explain`.
 */
import { Download } from 'lucide-react';

import { Button } from '@/registry/base/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/base/tooltip';

/** Khung chung — lặp lại ở đây vì file này cố ý KHÔNG import từ overlay-demos. */
function Khung({ huong, children }: { huong: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption1 text-muted-foreground">{huong}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function TooltipDemo() {
  return (
    <TooltipProvider>
      <Khung huong="Chỉ chứa CHỮ, và chữ đó phải là phần thêm — không bao giờ là thông tin duy nhất. Tab tới nút cũng mở được.">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Tải xuống" />}>
            <Download />
          </TooltipTrigger>
          <TooltipContent>Tải xuống bản .csv</TooltipContent>
        </Tooltip>
      </Khung>
    </TooltipProvider>
  );
}
