'use client';

import { cn } from 'cn';
import { type NavItem } from '@/registry/shells/app-sidebar';

/**
 * Thanh điều hướng dưới đáy cho điện thoại: chỉ icon, tên mục nằm trong `sr-only` cho trình đọc màn
 * hình. Trên màn rộng (từ `md`) nó ẩn và `AppSidebar` thay chỗ.
 *
 * Nhận ĐÚNG kiểu `NavItem` của `AppSidebar`, để hai thanh điều hướng của một app đọc chung một danh
 * sách mục và không lệch nhau. `isActive` và `renderLink` truyền vào cùng lý do như ở đó: hệ thiết kế
 * không chọn router hộ project tiêu thụ.
 *
 * Cỡ là quyết định của component, không của chỗ gọi: mỗi mục cao 44px (vùng chạm của Apple) và icon
 * 20px. Đây là chỗ DUY NHẤT trong hệ có icon lớn hơn 16px — thanh dưới không có chữ đi kèm, nên icon
 * phải tự đọc được ở khoảng cách một sải tay. Ngoại lệ đó được ghi trong `allow` của `icon-size-scale`.
 *
 * Dùng viewport breakpoint (`md:hidden`) chứ không container query: đây là bố cục cấp TRANG — thanh
 * dưới hay sidebar là câu hỏi về màn hình, không phải về hộp chứa.
 */
export function BottomNav({
  items,
  isActive,
  renderLink,
  label = 'Điều hướng chính',
  className,
}: {
  /** Tối đa 5 mục — hơn nữa thì mỗi mục hẹp hơn vùng chạm 44px trên màn 320px. */
  items: readonly NavItem[];
  isActive: (href: string) => boolean;
  /** Bọc nội dung mục thành một liên kết của framework đang dùng. */
  renderLink: (href: string, children: React.ReactNode, active: boolean) => React.ReactElement;
  label?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden',
        className
      )}
    >
      <ul className="mx-auto flex max-w-md">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              {renderLink(
                item.href,
                <span
                  className={cn(
                    'relative flex h-11 items-center justify-center text-muted-foreground',
                    active && 'text-primary'
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="sr-only">{item.label}</span>
                  {item.badge ? (
                    <span className="absolute top-1 left-1/2 ml-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-caption2 tabular-nums text-primary-foreground">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </span>,
                active
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Chừa chỗ dưới đáy nội dung để thanh dưới không che dòng cuối. Gắn vào vùng cuộn chính của trang;
 * từ `md` thanh dưới ẩn nên khoảng chừa cũng về 0.
 */
export const BOTTOM_NAV_SPACE = 'pb-[calc(--spacing(11)+env(safe-area-inset-bottom))] md:pb-0';
