import { Inbox, SearchX, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from 'cn';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/registry/base/empty';

/**
 * MỘT dáng "chưa có gì" cho mọi chỗ, để app đọc ra như một hệ thống.
 *
 * Dựng TRÊN `Empty` của shadcn chứ không dựng lại từ đầu — luật `reuse-before-build`. Bản ở sakubun
 * ra đời trước khi shadcn có `Empty`, nên nó tự vẽ cả khung; port thẳng sẽ là mang theo một bản sao
 * của thứ tầng dưới đã có. Thứ pattern này thêm vào là QUY ƯỚC: hai icon mang hai nghĩa khác nhau,
 * và một API phẳng để chỗ gọi không phải ghép 5 phần mỗi lần.
 *
 * Hai quy ước icon, và phân biệt chúng là việc quan trọng hơn vẻ ngoài:
 *  - `Inbox` (mặc định) — CHƯA CÓ dữ liệu. Trang nên giấu luôn thanh công cụ: không có gì để lọc.
 *  - `SearchX`          — CÓ dữ liệu nhưng bộ lọc hiện tại không khớp gì. Trang phải GIỮ thanh công
 *                         cụ, nếu không người dùng mắc kẹt: không thấy gì và cũng không có đường xoá
 *                         bộ lọc đang gây ra điều đó.
 *
 * `action` là chỗ cho bước tiếp theo. Một empty state không nói được bước tiếp theo thì nó chỉ đang
 * thông báo thất bại.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  children,
}: {
  /** `Inbox` = chưa có gì · `SearchX` = lọc không khớp · `null` = empty gọn trong card, không icon. */
  icon?: LucideIcon | null;
  title?: string;
  description?: ReactNode;
  /** Bước tiếp theo — nút tạo, nút nhập, nút xoá bộ lọc. */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Empty className={cn('rounded-lg border border-dashed', className)}>
      <EmptyHeader>
        {Icon ? (
          <EmptyMedia variant="icon">
            <Icon aria-hidden />
          </EmptyMedia>
        ) : null}
        {title ? <EmptyTitle>{title}</EmptyTitle> : null}
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}

/** Empty cho trạng thái "lọc không khớp" — giữ nguyên thanh công cụ ở trang gọi. */
export function NoMatchState({
  onClear,
  className,
}: {
  /** Nút xoá bộ lọc. BẮT BUỘC có đường thoát, nếu không người dùng mắc kẹt. */
  onClear?: ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      icon={SearchX}
      title="Không có kết quả khớp"
      description="Bộ lọc hiện tại không khớp mục nào. Thử nới bộ lọc hoặc xoá nó."
      action={onClear}
      className={className}
    />
  );
}
