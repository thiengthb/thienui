'use client';

import { cn } from 'cn';
import { Explain } from '@/registry/patterns/explain';

/**
 * Mốc thời gian tương đối ("3 giờ trước") với thời điểm chính xác hiện khi hover/focus.
 *
 * Hai thứ ở đây đáng chú ý hơn vẻ ngoài của nó.
 *
 * MỘT — `suppressHydrationWarning`. Chữ tương đối phụ thuộc đồng hồ, nên server và client gần như
 * luôn tính ra khác nhau vài giây. Đó KHÔNG phải markup cũ, nên cảnh báo hydration ở đây là tiếng ồn.
 * Nhưng chỉ tắt ở ĐÚNG phần tử mang chữ thời gian — tắt ở cấp cao hơn sẽ giấu luôn những lệch thật.
 *
 * HAI — lời giải thích đi qua `Explain`, không qua `title=`. Thời điểm chính xác là thông tin người
 * dùng thật sự cần (một mục "3 ngày trước" đến hạn lúc nào?), và với `title=` thì nó không tồn tại
 * trên điện thoại.
 *
 * Hàm định dạng được TRUYỀN VÀO chứ không nhúng sẵn: ở sakubun chúng gọi `lib/format` với múi giờ
 * Việt Nam và tiếng Việt. Một hệ thiết kế dùng chung không được tự quyết ngôn ngữ và múi giờ cho
 * project tiêu thụ.
 */
export function RelativeTime({
  value,
  format,
  exact,
  className,
  tabular = false,
}: {
  value: string | number | Date;
  /** Chữ tương đối: "3 giờ trước" / "còn 2 ngày". */
  format: (date: Date) => string;
  /** Thời điểm chính xác hiện trong tooltip. */
  exact: (date: Date) => string;
  className?: string;
  /** Bật khi các mốc này xếp thành CỘT — chữ số rộng bằng nhau mới thẳng hàng. */
  tabular?: boolean;
}) {
  const date = new Date(value);
  return (
    <Explain text={exact(date)}>
      <span className={cn('cursor-default', tabular && 'tabular-nums', className)} suppressHydrationWarning>
        {format(date)}
      </span>
    </Explain>
  );
}
