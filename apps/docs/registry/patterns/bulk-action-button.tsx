'use client';

import { type ReactNode } from 'react';
import { cn } from 'cn';
import { Button } from '@/registry/base/button';
import { Explain } from '@/registry/patterns/explain';

/**
 * Một hành động trên NHIỀU DÒNG ĐÃ CHỌN: nút chỉ-icon, tên nằm trong tooltip, `aria-label` luôn có.
 *
 * Luật `bulk-actions-icon-dock`. Lý do là về LAYOUT, không về thẩm mỹ: hành động bulk xuất hiện và
 * biến mất theo lựa chọn, nên nếu chúng là nút có chữ thì bảng nhảy mỗi lần chọn/bỏ chọn một dòng —
 * và nó nhảy đúng lúc con trỏ đang ở đó. Dock chỉ-icon ở vị trí cố định giữ layout yên.
 *
 * `aria-label` KHÔNG phải tuỳ chọn và không được thay bằng tooltip: tooltip của `Explain` hiện khi
 * hover/focus, nhưng trình đọc màn hình cần một tên ngay cả khi không có cả hai.
 */
export function BulkActionButton({
  icon,
  label,
  onClick,
  disabled,
  variant = 'ghost',
  className,
}: {
  icon: ReactNode;
  /** Vừa là tooltip, vừa là accessible name. Một chuỗi, hai việc — nên chúng không lệch nhau được. */
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'ghost' | 'destructive' | 'secondary';
  className?: string;
}) {
  return (
    <Explain text={label} side="left">
      <Button
        variant={variant}
        size="icon-sm"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={cn('target-44', className)}
      >
        {icon}
      </Button>
    </Explain>
  );
}

/**
 * Dock dọc chứa các `BulkActionButton`.
 *
 * Nó nổi ở mép phải, giữa chiều cao — không nằm trong luồng của bảng. Lý do: nếu nó chiếm chỗ trong
 * luồng thì bảng co lại mỗi khi có lựa chọn, và đó đúng là cái nhảy mà luật này sinh ra để tránh.
 *
 * `position: fixed` ở đây có một cái bẫy đã ghi lại ở sakubun: BẤT KỲ `transform` nào trên một tổ
 * tiên sẽ tạo containing block mới và dock sẽ neo sai — và nếu trang đang cuộn thì lệch rất xa chứ
 * không phải vài pixel. Đó là lý do hiệu ứng chuyển trang ở đó chỉ dùng `opacity`.
 */
export function BulkActionDock({
  count,
  children,
  className,
}: {
  /** Số dòng đang chọn. Dock tự ẩn khi bằng 0. */
  count: number;
  children: ReactNode;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <div
      role="toolbar"
      aria-label={`${count} mục đang chọn`}
      aria-orientation="vertical"
      className={cn(
        'fixed top-1/2 right-3 z-40 flex -translate-y-1/2 flex-col items-center gap-1',
        'rounded-full border bg-popover p-1.5 shadow-3',
        className
      )}
    >
      <span className="px-1 pt-0.5 text-caption2 tabular-nums text-muted-foreground">{count}</span>
      {children}
    </div>
  );
}
