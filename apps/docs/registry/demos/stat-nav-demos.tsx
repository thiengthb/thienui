'use client';

/**
 * Demo cho `Stat` (ô số liệu) và `BottomNav` (thanh điều hướng dưới) — hai chỗ mà bản mẫu sakubun
 * lệch cỡ: icon to trên desktop, icon to nhỏ lẫn lộn giữa các ô.
 */
import * as React from 'react';
import { BookOpen, ChartColumn, Flame, Home, Layers, Settings, Target } from 'lucide-react';

import { Stat, StatSkeleton } from '@/registry/patterns/stat';
import { BottomNav } from '@/registry/shells/bottom-nav';
import { type NavItem } from '@/registry/shells/app-sidebar';

export function StatDemo() {
  return (
    <div className="@container flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 @md:grid-cols-4">
        <Stat icon={Flame} label="Chuỗi" value="12" explain="Số ngày liên tiếp có ít nhất một lượt ôn." />
        <Stat icon={Target} label="Đúng" value="87%" explain="Tỉ lệ trả lời đúng trong 30 ngày qua." />
        <Stat icon={Layers} label="Đến hạn" value="0" />
        <Stat
          icon={BookOpen}
          label="Mục đã học trong toàn bộ thư viện"
          value="12.480"
          explain="Nhãn dài thì cắt, số lớn thì chỗ gọi tự rút gọn — chỉ chỗ gọi biết đơn vị."
        />
      </div>
      <div className="grid grid-cols-2 gap-2 @md:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Mọi ô cùng một cỡ icon và cùng một cỡ số, vì chỗ gọi không chọn được. Lời giải thích nằm sau nút
        (i), không thành một dòng chữ dưới con số. Hàng dưới là khung chờ, cao đúng bằng ô thật.
      </p>
    </div>
  );
}

const MUC: readonly NavItem[] = [
  { href: '/', label: 'Hôm nay', icon: Home, badge: 24 },
  { href: '/thu-vien', label: 'Thư viện', icon: BookOpen },
  { href: '/phan-tich', label: 'Phân tích', icon: ChartColumn },
  { href: '/cai-dat', label: 'Cài đặt', icon: Settings },
];

export function BottomNavDemo() {
  const [duong, setDuong] = React.useState('/');
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-40 w-80 max-w-full overflow-hidden rounded-lg border bg-muted">
        {/* Thanh thật là `fixed` và ẩn từ `md`. Ở đây ghi đè thành `absolute` + luôn hiện để xem
            được trong khung giả lập điện thoại. */}
        <BottomNav
          className="absolute md:block"
          items={MUC}
          isActive={(href) => href === duong}
          renderLink={(href, kids, active) => (
            <button
              type="button"
              className="w-full"
              aria-current={active ? 'page' : undefined}
              onClick={() => setDuong(href)}
            >
              {kids}
            </button>
          )}
        />
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Chỉ icon, tên mục cho trình đọc màn hình. Mỗi mục cao 44px, icon 20px: đây là chỗ duy nhất trong
        hệ icon lớn hơn 16px, vì không có chữ đi kèm.
      </p>
    </div>
  );
}
