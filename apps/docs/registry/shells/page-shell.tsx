import { type ReactNode } from 'react';
import { cn } from 'cn';
import {
  PAGE_DESCRIPTION,
  PAGE_HEADER_ASIDE,
  PAGE_HEADER_ROW,
  PAGE_TITLE,
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
  title,
  description,
  breadcrumb,
  headerAside,
  width = 'full',
  className,
}: {
  children: ReactNode;
  /**
   * `<h1>` của trang. Thiếu prop này là lỗ hổng pha 6 bắt được: một "page shell" không có chỗ đặt
   * tiêu đề thì mỗi trang tự gõ lại chuỗi class của riêng nó, và chúng lệch — kể cả trong app của
   * chính thienui, nơi ba trang gõ `text-title1 font-semibold tracking-tight` và trang thứ tư
   * dùng `text-large-title`.
   */
  title?: ReactNode;
  /** Một dòng nói trang này LÀM GÌ. Không phải chỗ nhắc lại tiêu đề bằng từ khác. */
  description?: ReactNode;
  /** Vệt breadcrumb. Trang nào cũng nên có — nó là thứ nói người dùng đang ở đâu. */
  breadcrumb?: ReactNode;
  /** Dựng bên phải hàng breadcrumb — một `<TabsList>` và/hoặc một nút hành động của trang. */
  headerAside?: ReactNode;
  width?: PageWidth;
  className?: string;
}) {
  return (
    <div className={cn('@container/page', PAGE_ROOT, PAGE_WIDTH[width], className)}>
      {breadcrumb ? <div className={PAGE_HEADER_ROW}>{breadcrumb}</div> : null}
      {title || headerAside ? (
        /* `items-start` đè `items-center` của hàng chung: khối tiêu đề cao hai dòng khi có mô tả,
           nên căn giữa sẽ kéo nút hành động xuống lưng chừng. */
        <div className={cn(PAGE_HEADER_ROW, 'items-start')}>
          {title ? (
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className={PAGE_TITLE}>{title}</h1>
              {description ? <p className={PAGE_DESCRIPTION}>{description}</p> : null}
            </div>
          ) : null}
          {headerAside ? <div className={PAGE_HEADER_ASIDE}>{headerAside}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
