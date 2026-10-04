import { type ReactNode } from 'react';
import { cn } from 'cn';
import {
  PAGE_HEADER_ASIDE,
  PAGE_HEADER_ROW,
  PAGE_ROOT,
  PAGE_WIDTH,
  type PageWidth,
} from '@/registry/shells/page-chrome';

/**
 * Vỏ trang mà MỌI route dùng — nguồn sự thật duy nhất cho nhịp dọc của trang.
 *
 * `AppShell` chỉ sở hữu bề rộng ngang và padding hai bên. Trước khi có component này, ở sakubun mỗi
 * trang tự dựng `py-8 space-y-6` + max-width + breadcrumb của riêng nó, và chúng trôi: vài trang
 * không có breadcrumb, max-width rải từ `2xl` tới `5xl` một cách ngẫu nhiên.
 *
 * Là SERVER component (nó chỉ dựng khung), nên nó rơi thẳng vào một server page không cần `use client`.
 *
 * Trang có tab truyền `<TabsList>` qua `headerAside` — quy ước là tab nằm CẠNH breadcrumb trên một
 * hàng. Mô tả trang KHÔNG phải một đoạn văn ở đây; nó sống trong lời giải thích của chính crumb.
 *
 * `@container/page` để thân trang phản ứng theo bề rộng CỦA NÓ: cùng một trang có thể nằm cạnh một
 * sidebar mở hoặc đóng, và viewport không nói được gì về chuyện đó.
 */
export function PageShell({
  children,
  breadcrumb,
  headerAside,
  width = 'full',
  className,
}: {
  children: ReactNode;
  /** Vệt breadcrumb. Trang nào cũng nên có — nó là thứ nói người dùng đang ở đâu. */
  breadcrumb?: ReactNode;
  /** Dựng bên phải hàng breadcrumb — một `<TabsList>` và/hoặc một nút hành động của trang. */
  headerAside?: ReactNode;
  width?: PageWidth;
  className?: string;
}) {
  return (
    <div className={cn('@container/page', PAGE_ROOT, PAGE_WIDTH[width], className)}>
      {breadcrumb || headerAside ? (
        <div className={PAGE_HEADER_ROW}>
          {breadcrumb}
          {headerAside ? <div className={PAGE_HEADER_ASIDE}>{headerAside}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
