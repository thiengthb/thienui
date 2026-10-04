'use client';

import { type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from 'cn';
import { Explain } from '@/registry/patterns/explain';

/**
 * Nút (i) THÊM VÀO bên cạnh một thứ, để giải thích thứ đó.
 *
 * Anh em với `Explain`, và ranh giới giữa hai cái là: `Explain` khi CÓ phần tử để bọc,
 * `InfoTooltip` khi KHÔNG có — ví dụ lời giải thích nói về cả một mục, hoặc về một nhãn cột mà bọc
 * vào sẽ làm cả cột có gạch chân.
 *
 * Nó là một `<button>` thật chứ không phải một `<span>` có icon, và đó không phải chi tiết nhỏ: một
 * span không nhận được focus bàn phím, nên lời giải thích sẽ không tồn tại với người không dùng
 * chuột. `type="button"` để nó không submit form khi nằm trong một form.
 *
 * Vùng chạm phủ 44px qua `.target-44` (trong `@thienui/tokens/base.css`) mà KHÔNG phóng to phần nhìn
 * thấy — hit-area overflow. Một nút 16px là một nút trượt tay trên điện thoại.
 */
export function InfoTooltip({
  text,
  label = 'Giải thích',
  side = 'top',
  className,
}: {
  text: ReactNode;
  /** Tên cho trình đọc màn hình. Nút chỉ-icon BẮT BUỘC có. */
  label?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}) {
  if (!text) return null;
  return (
    <Explain text={text} side={side}>
      <button
        type="button"
        aria-label={label}
        className={cn(
          'target-44 inline-grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground',
          'hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className
        )}
      >
        <Info className="size-3.5" aria-hidden />
      </button>
    </Explain>
  );
}
