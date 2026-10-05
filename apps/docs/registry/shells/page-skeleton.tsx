import { type ReactNode } from 'react';
import { cn } from 'cn';
import { Skeleton } from '@/registry/base/skeleton';
import {
  PAGE_HEADER_ASIDE,
  PAGE_HEADER_ROW,
  PAGE_ROOT,
  PAGE_WIDTH,
  type PageWidth,
} from '@/registry/shells/page-chrome';

/**
 * Khung loading PHẢN CHIẾU `PageShell` — cùng padding, cùng nhịp, cùng bậc bề rộng, và cùng HÀNG
 * HEADER ở mọi bề rộng. Mỗi `loading.tsx` của route ghép skeleton theo hình dữ liệu của nó vào làm con.
 *
 * Hàng header không được chép từ `PageShell` — nó IMPORT đúng những hằng số mà `PageShell` dùng
 * (`page-chrome.ts`). Chép thì sẽ lệch; import thì không lệch được. Đó là khác biệt giữa một bài test
 * bắt lỗi sau khi xảy ra và một cấu trúc làm lỗi không xảy ra được.
 *
 * Luật `skeleton-mirrors-its-page` vẫn áp cho phần THÂN: một skeleton không khớp trang thật thì tệ
 * hơn không có skeleton — nội dung thật xuất hiện, layout nhảy, người dùng mất chỗ đang đọc. Skeleton
 * tồn tại để GIỮ layout, không phải để báo là đang tải.
 */
export function PageSkeleton({
  children,
  width = 'full',
  hasAside = false,
  hasBreadcrumb = false,
  hasDescription = false,
  className,
}: {
  children?: ReactNode;
  width?: PageWidth;
  /** Bật khi trang thật có `headerAside` — nếu không, hàng header sẽ ngắn hơn và vẫn nhảy. */
  hasAside?: boolean;
  /** Bật khi trang thật truyền `breadcrumb` — nó là MỘT HÀNG RIÊNG phía trên tiêu đề. */
  hasBreadcrumb?: boolean;
  /** Bật khi trang thật truyền `description` — nó làm khối tiêu đề cao thêm một dòng. */
  hasDescription?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('@container/page', PAGE_ROOT, PAGE_WIDTH[width], className)} aria-busy>
      {hasBreadcrumb ? (
        <div className={PAGE_HEADER_ROW}>
          <Skeleton className="h-5 w-48" />
        </div>
      ) : null}
      {/* Phản chiếu khối tiêu đề của `PageShell`: `h-8` khớp `text-title1`, dòng mô tả khớp
          `text-subhead`. Thiếu dòng mô tả ở đây là đúng kiểu lệch 41px mà `page-chrome.ts` sinh ra
          để chặn — chỉ khác là lần này nó lệch theo CHIỀU CAO. */}
      <div className={cn(PAGE_HEADER_ROW, 'items-start')}>
        <div className="flex min-w-0 flex-col gap-1">
          <Skeleton className="h-8 w-56" />
          {hasDescription ? <Skeleton className="h-4 w-80 max-w-full" /> : null}
        </div>
        {hasAside ? (
          <div className={PAGE_HEADER_ASIDE}>
            <Skeleton className="h-8 w-40" />
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Skeleton hình BẢNG: cùng số cột và cùng chiều cao hàng với bảng thật. */
export function TableSkeleton({ rows = 8, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex gap-3 border-b bg-muted/40 p-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-3 border-b p-3 last:border-0">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton hình GRID CARD. Số cột dùng container query, khớp với grid thật. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 @md/page:grid-cols-2 @4xl/page:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
