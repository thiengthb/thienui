'use client';

import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/base/tooltip';

/**
 * Bọc một phần tử để CHÍNH NÓ tự giải thích khi hover, focus và trên thiết bị cảm ứng.
 *
 * Đây là cách DUY NHẤT được phép gắn lời giải thích vào nội dung có sẵn — luật
 * `explain-is-the-only-tooltip`. Ở sakubun từng có hai cơ chế mọc song song tại 26 chỗ: thuộc tính
 * `title=` của browser và Tooltip primitive dựng tay.
 *
 * `title=` thua ba đường, và đường thứ ba mới là đường quan trọng: nó KHÔNG BAO GIỜ hiện trên thiết
 * bị cảm ứng (nên trên điện thoại lời giải thích đơn giản là không tồn tại), nó do OS vẽ nên bỏ qua
 * theme hoàn toàn, và độ trễ ~1s của nó không chỉnh được. Nó đọc ra rẻ vì chỉ là một thuộc tính —
 * nhưng cái giá rơi vào người cầm điện thoại, không rơi vào người viết.
 *
 * Hai anh em, để chọn đúng cái:
 *  - `Explain` (ở đây) — nội dung CÓ SẴN tự giải thích. Không thêm affordance, không đổi layout.
 *  - `InfoTooltip`     — THÊM một nút (i) bên cạnh. Dùng khi không có phần tử nào để bọc, hoặc khi
 *                        lời giải thích nói về cả một mục chứ không về một control.
 *
 * Base UI dùng prop `render` thay cho `asChild` của Radix. Hệ quả giống nhau và là điều kiện để
 * component này dùng được: KHÔNG chèn thêm phần tử bọc, nên con giữ nguyên layout của nó — bọc một
 * flex item không làm vỡ hàng.
 */
export function Explain({
  children,
  text,
  side = 'top',
  align,
  className,
  onOpenChange,
}: {
  /** Phần tử đang được giải thích — nhận thẳng props của trigger. */
  children: ReactNode;
  /** Nó là gì, dùng làm gì, con số đến từ đâu. Viết cho người nhìn nó lần thứ mười. */
  text: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Căn bong bóng dọc theo `side` — 'end' giữ một panel rộng nằm trong màn hình khi ở sát mép. */
  align?: 'start' | 'center' | 'end';
  /** Class thêm cho BONG BÓNG, không phải cho trigger. */
  className?: string;
  /** Bắn khi bong bóng mở/đóng — cho một gợi ý tự đánh dấu đã đọc khi thật sự được xem. */
  onOpenChange?: (open: boolean) => void;
}) {
  // Một phần tử không có gì để nói thì render nguyên trạng thay vì thành một bong bóng rỗng, nên
  // người gọi có thể truyền một mô tả có-thể-null mà không phải rẽ nhánh ở mọi chỗ gọi.
  if (!text) return <>{children}</>;

  return (
    <Tooltip onOpenChange={onOpenChange}>
      <TooltipTrigger render={children as React.ReactElement} />
      <TooltipContent
        side={side}
        align={align}
        className={['max-w-xs text-left leading-body break-words whitespace-normal', className ?? ''].join(' ')}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
