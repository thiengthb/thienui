'use client';

import * as React from 'react';
import { ConfirmDialog } from '@/registry/patterns/confirm-dialog';
import { Button } from '@/registry/base/button';

export function ConfirmDialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function runDelete() {
    setPending(true);
    // Giả lập một thao tác đã gửi đi, để thấy CẢ HAI nút bị khoá trong lúc chờ.
    setTimeout(() => {
      setPending(false);
      setOpen(false);
      setDone(true);
    }, 1400);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="destructive" onClick={() => { setDone(false); setOpen(true); }}>
        Xoá 12 mục
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Xoá 12 mục đã chọn?"
        description="Lịch sử ôn tập của 12 mục này sẽ mất và không khôi phục được. Các nhóm chứa chúng vẫn giữ nguyên."
        confirmLabel="Xoá vĩnh viễn"
        onConfirm={runDelete}
        pending={pending}
      />

      {done ? <p className="text-footnote text-ok">Đã xoá.</p> : null}
      <p className="text-caption1 text-muted-foreground">
        Mô tả nói rõ HẬU QUẢ (mất cái gì, giữ cái gì), không chỉ hỏi “bạn có chắc không”. Bấm xác nhận
        để thấy cả hai nút bị khoá trong lúc thao tác chạy.
      </p>
    </div>
  );
}
