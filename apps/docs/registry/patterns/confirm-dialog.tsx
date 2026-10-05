'use client';

import { type ReactNode } from 'react';
import { Button } from '@/registry/base/button';
import { Spinner } from '@/registry/base/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/base/dialog';

/**
 * Hộp xác nhận cho hành động PHÁ HOẠI / không hoàn tác được.
 *
 * Luật `destructive-confirm-uses-dialog` bắt mọi lần xoá, ban, thu hồi đi qua đây. Lý do không phải
 * là gọn code: một dialog tự dựng sẽ thiếu một trong các thứ — focus trap, Esc để đóng, focus trả về
 * chỗ cũ, nhãn nói rõ hậu quả, trạng thái loading lúc đang xoá. Mỗi thứ thiếu là một đường để người
 * dùng xoá mất dữ liệu họ không định xoá. Ở sakubun nó được rút ra từ 3 bản dựng tay lặp lại cùng
 * một khung (bulk-delete, ban, revoke-token).
 *
 * TRIGGER và trạng thái `open` ở lại với người gọi — mỗi chỗ điều khiển `open` một kiểu (một boolean,
 * hay một memo của mục đang chọn) — nên component này chỉ sở hữu thân modal và hai cái nút.
 *
 * `pending` khoá MỌI ĐƯỜNG RA, không chỉ nút xác nhận: bấm "Huỷ" giữa chừng một thao tác đã gửi đi sẽ
 * đóng modal trong khi việc vẫn đang chạy, và người dùng mất chỗ duy nhất để biết kết quả.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
  children,
  cancelLabel = 'Huỷ',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Nói rõ HẬU QUẢ, không chỉ hỏi "bạn có chắc không". */
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  /** Trường nhập nằm trong hộp xác nhận (ví dụ lý do ban), đặt giữa mô tả và footer. */
  children?: ReactNode;
  cancelLabel?: string;
}) {
  return (
    <Dialog
      open={open}
      /*
       * Trong lúc `pending`, BỎ QUA mọi yêu cầu đóng. Khoá hai cái nút là chưa đủ: pha 6 đo được
       * rằng hộp vẫn đóng được bằng **Esc**, bằng **nút ×**, và bằng **bấm ra ngoài** — ba đường,
       * mỗi đường gây đúng cái hậu quả mà việc khoá nút dựng lên để chặn.
       *
       * Chặn ở đây chứ không chặn ở từng chỗ: cả ba đều đi qua `onOpenChange`, nên một cửa là đủ,
       * và một cửa thì không quên được đường thứ tư.
       */
      onOpenChange={(next) => {
        if (pending && !next) return;
        onOpenChange(next);
      }}
    >
      {/* Nút × biến mất đúng lúc hai nút kia xám đi — để cả hộp ĐỌC RA là đang bận, thay vì để lại
          một control bấm vào không có gì xảy ra. */}
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending} aria-busy={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
