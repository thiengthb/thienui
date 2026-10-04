'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from 'cn';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/registry/base/sidebar';

export type NavItem = {
  href: string;
  label: string;
  /** Icon từ `lucide-react`. Luật `lucide-icons-only` — không tự vẽ thẻ svg, không emoji làm icon. */
  icon: LucideIcon;
  /** Huy hiệu số (số mục đến hạn, số thông báo). */
  badge?: number;
};

export type NavGroup = { label?: string; items: NavItem[] };

/**
 * Sidebar điều hướng của app.
 *
 * Là `canonical` của luật `lucide-icons-only`, và đó không phải tình cờ: sidebar là nơi icon đứng
 * cạnh nhau nhiều nhất, nên một icon tự vẽ lệch stroke width hay lệch thang cỡ hiện ra ngay — trong
 * khi ở một chỗ lẻ loi thì không ai thấy. Ngoại lệ DUY NHẤT của luật là svg RENDER DỮ LIỆU (đường
 * cong, sparkline) và logo thương hiệu bên thứ ba không có bản lucide.
 *
 * `isActive` được TRUYỀN VÀO chứ không tự đọc router: một hệ thiết kế dùng chung không được chọn hộ
 * project tiêu thụ là Next, React Router hay TanStack Router. Chỗ gọi truyền `usePathname()` vào.
 *
 * `Link` cũng được truyền vào qua `renderLink`, cùng lý do — và vì component điều hướng của mỗi
 * framework có prop khác nhau.
 */
export function AppSidebar({
  groups,
  isActive,
  renderLink,
  header,
  footer,
  className,
}: {
  groups: readonly NavGroup[];
  /** Mục nào đang mở. Chỗ gọi quyết định — thường so với đường dẫn hiện tại. */
  isActive: (href: string) => boolean;
  /** Bọc nội dung mục thành một liên kết của framework đang dùng. */
  renderLink: (href: string, children: React.ReactNode) => React.ReactElement;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Sidebar className={className}>
      {header ? <SidebarHeader>{header}</SidebarHeader> : null}
      <SidebarContent>
        {groups.map((group, gi) => (
          <SidebarGroup key={group.label ?? gi}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive(item.href)}
                        render={renderLink(
                          item.href,
                          <>
                            <Icon aria-hidden />
                            {/* Nhãn PHẢI truncate — tên mục do dữ liệu quyết định, và một tên dài
                                sẽ đẩy huy hiệu ra khỏi sidebar. Luật text-must-truncate. */}
                            <span className="min-w-0 truncate">{item.label}</span>
                            {item.badge ? (
                              <span className="ml-auto shrink-0 tabular-nums text-caption2 text-muted-foreground">
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            ) : null}
                          </>
                        )}
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
    </Sidebar>
  );
}

/** Hàng thương hiệu trên đầu sidebar. Tách ra vì nó là chỗ DUY NHẤT được dùng logo không-lucide. */
export function AppLogo({
  mark,
  name,
  className,
}: {
  /** Logo thương hiệu. Đây là ngoại lệ được nêu tên của luật `lucide-icons-only`. */
  mark: React.ReactNode;
  name: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 px-2 py-1.5', className)}>
      <span className="grid size-6 shrink-0 place-items-center">{mark}</span>
      <span className="min-w-0 truncate font-semibold tracking-snug">{name}</span>
    </div>
  );
}
