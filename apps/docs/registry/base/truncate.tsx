'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from 'cn';
import { Explain } from '@/registry/patterns/explain';

/**
 * Truncate một dòng, CÓ ĐO: chỉ hiện tooltip khi chữ thật sự tràn.
 *
 * Luật `text-must-truncate` đòi mọi chữ một dòng có thể vượt hộp phải truncate. Nhưng truncate không
 * thôi thì mất nội dung — nên nó đi kèm một lối xem đầy đủ. Và lối đó chỉ được xuất hiện khi CẦN:
 * một tooltip lặp lại đúng chữ đang hiện là nhiễu, và nó dạy người dùng rằng tooltip ở đây vô nghĩa.
 *
 * Đo bằng `scrollWidth > clientWidth` cộng `ResizeObserver`, không bằng cách đếm ký tự: số ký tự vừa
 * một hộp phụ thuộc font, cỡ chữ, và chữ nào — "mmm" rộng gấp ba "iii" ở cùng số ký tự.
 *
 * Nằm ở tầng `base` chứ không phải `patterns` vì nó là nguyên thuỷ: các pattern khác (bảng, breadcrumb,
 * menu) dựng lên trên nó.
 */
export function Truncate({
  children,
  full,
  className,
  side = 'bottom',
}: {
  children: ReactNode;
  /** Nội dung đầy đủ hiện trong tooltip; mặc định là `children` (dùng khi children là chuỗi). */
  full?: ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (el) setOverflow(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Đo TRONG ResizeObserver, không gọi check() thẳng trong thân effect: observer bắn một lần ngay
    // khi observe, nên lần đo đầu vẫn có — mà không phải setState đồng bộ trong effect.
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [check, children]);

  const span = (
    <span ref={ref} className={cn('block min-w-0 truncate', className)}>
      {children}
    </span>
  );

  if (!overflow) return span;
  return (
    <Explain text={full ?? children} side={side}>
      {span}
    </Explain>
  );
}
