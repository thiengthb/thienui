'use client';

import { type ReactNode } from 'react';
import { cn } from 'cn';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/registry/base/sidebar';

/**
 * Khung ngoài cùng của app: sidebar + thanh trên dính + vùng nội dung.
 *
 * Nó chỉ sở hữu BỀ RỘNG NGANG và padding hai bên. Nhịp dọc thuộc về `PageShell` — tách như vậy để
 * mỗi trang không tự dựng container của riêng nó, thứ đã làm max-width ở sakubun trôi từ `2xl` tới
 * `5xl` một cách ngẫu nhiên.
 *
 * ĐÂY là `canonical` của luật `glass-only-on-chrome`, và thanh trên là một trong rất ít chỗ glass
 * được phép. Lý do giới hạn: `backdrop-filter` lấy màu từ nội dung phía sau, mà nội dung thì không
 * biết trước — nên cổng contrast (đo TOKEN) không thể đo nó. Giới hạn vào chrome đè lên nội dung giữ
 * được cảm giác vật liệu mà không biến một phần nội dung thành vùng không ai kiểm được.
 *
 * Có token nền ĐẶC làm fallback: `bg-background/80` áp trước, lớp glass chỉ thêm vào sau
 * `supports-backdrop-filter:`. Máy không hỗ trợ vẫn đọc được, và sàn contrast đo trên bản đặc đó.
 *
 * MỘT CÁI BẪY đã trả giá ở sakubun: đừng đặt `transform` lên phần tử bọc cả trang. Một transform tạo
 * containing block mới cho MỌI `position: fixed` bên trong nó — và trong một app thật luôn có vài
 * thứ như vậy (dock hành động bulk, lớp phủ ăn mừng). Chúng sẽ neo sai, và nếu trang đang cuộn thì
 * lệch rất xa chứ không phải vài pixel. Hiệu ứng chuyển trang vì thế chỉ được dùng `opacity`.
 */
export function AppShell({
  sidebar,
  children,
  topBar,
  defaultSidebarOpen = true,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  /** Nội dung thanh trên, bên phải nút thu/mở sidebar. */
  topBar?: ReactNode;
  defaultSidebarOpen?: boolean;
  className?: string;
}) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      {sidebar}
      <SidebarInset className={cn('min-w-0', className)}>
        <header
          className={cn(
            'sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b px-4',
            // Nền ĐẶC trước; glass chỉ là lớp tăng cường.
            'bg-background/80 supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-md'
          )}
        >
          <SidebarTrigger className="target-44 -ml-1" />
          {topBar ? <div className="flex min-w-0 flex-1 items-center gap-2">{topBar}</div> : null}
        </header>

        {/* Bề rộng và padding ngang sống ở ĐÂY, và chỉ ở đây. */}
        <div className="mx-auto w-full max-w-7xl px-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
