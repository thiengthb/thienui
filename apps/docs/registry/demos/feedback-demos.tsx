'use client';

/**
 * Demo cho phản hồi tạm thời và cho mấy tiện ích không có hình: toast, sonner, hook đo màn hình.
 *
 * Toast là bề mặt duy nhất trong hệ **tự biến mất**. Nên luật đi kèm nó cũng khác: thứ gì người dùng
 * cần đọc lại được thì không được chỉ sống trong một toast.
 */
import * as React from 'react';
import { toast as toaster } from 'sonner';

import { Button } from '@/registry/base/button';
import { Label } from '@/registry/base/label';
import { Slider } from '@/registry/base/slider';
import { Toaster, toast } from '@/registry/base/toast';
import { Toaster as SonnerToaster } from '@/registry/base/sonner';
import { useIsMobile } from '@/registry/base/use-mobile';
import { fitItemCount } from '@/registry/base/fit-rows';
import { useFitRows } from '@/registry/base/use-fit-rows';

export function ToastDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Toaster />
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => toast.add({ title: 'Đã lưu bộ thẻ', description: '128 thẻ, đồng bộ xong.' })}
        >
          Toast thường
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: 'Đã xoá 3 thẻ',
              description: 'Hoàn tác được trong 10 giây.',
              actionProps: { children: 'Hoàn tác', onClick: () => toast.add({ title: 'Đã hoàn tác' }) },
            })
          }
        >
          Toast có hành động
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(new Promise((r) => setTimeout(r, 1600)), {
              loading: { title: 'Đang đồng bộ…' },
              success: { title: 'Đồng bộ xong' },
              error: { title: 'Không đồng bộ được', description: 'Kiểm tra kết nối rồi thử lại.' },
            })
          }
        >
          Toast theo promise
        </Button>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Nút “Hoàn tác” nằm TRONG toast là lý do chính để dùng toast thay vì một hộp xác nhận: việc đã
        chạy rồi, người dùng không bị chặn, mà vẫn rút lại được. Nhưng vì toast tự tắt, <strong>lỗi
        cần xử lý thì không được chỉ nằm ở đây</strong> — nó phải còn ở chỗ gây ra lỗi.
      </p>
    </div>
  );
}

export function SonnerDemo() {
  return (
    <div className="flex flex-col gap-3">
      <SonnerToaster />
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => toaster.success('Đã lưu bộ thẻ')}>
          success
        </Button>
        <Button variant="outline" onClick={() => toaster.error('Không đồng bộ được')}>
          error
        </Button>
        <Button variant="outline" onClick={() => toaster.warning('Còn 2 thẻ chưa gán bộ')}>
          warning
        </Button>
        <Button variant="outline" onClick={() => toaster.info('Lịch ôn đã cập nhật')}>
          info
        </Button>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Hai bộ toast cùng có trong registry, và đó là CÓ CHỦ Ý chứ không phải trùng: <code>toast</code>{' '}
        chạy trên Base UI nên dùng chung cơ chế lớp nổi với dialog và menu; <code>sonner</code> là thư
        viện ngoài, đẹp sẵn, xếp chồng tốt hơn. <strong>Chọn một và dùng một</strong> — hai hệ toast
        trong cùng một app nghĩa là hai vị trí, hai thời lượng, hai kiểu xếp chồng.
      </p>
    </div>
  );
}

export function UseIsMobileDemo() {
  const mobile = useIsMobile();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <code className="text-footnote">useIsMobile()</code>
        <span className="rounded-md bg-muted px-2 py-0.5 text-footnote tabular-nums">
          {String(mobile)}
        </span>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Kéo hẹp cửa sổ qua 768px để thấy nó đổi. Đây là viewport query thật, nên nó chỉ đúng cho những
        quyết định <strong>về cả màn hình</strong> — sidebar thành drawer, menu thành sheet. Mọi thứ
        bên trong một component thì dùng container query, vì component không biết nó được đặt vào hộp
        rộng bao nhiêu.
      </p>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Hook này đã được viết lại bằng <code>useSyncExternalStore</code> ở pha 6 — bản upstream gọi
        <code> setState</code> trong effect, nên nó luôn vẽ một lần với giá trị sai, và làm
        <code> pnpm lint</code> của project tiêu thụ đỏ ngay ngày đầu.
      </p>
    </div>
  );
}

export function FitRowsDemo() {
  const [cao, setCao] = React.useState(900);
  const so = fitItemCount({
    viewportHeight: cao,
    rowsTop: 220,
    footerHeight: 72,
    rowHeight: 52,
    min: 5,
    max: 50,
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-md flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label>viewportHeight</Label>
          <span className="text-footnote tabular-nums">{cao}px</span>
        </div>
        {/* Dùng `Slider` của registry chứ không dựng một thẻ input kiểu range trần. Luật
            `input-clear-affordance` chặn mọi thẻ input viết thẳng, và ở đây nó bắt ĐÚNG: một demo
            của hệ này mà lách ra ngoài hệ thì nó đang chứng minh điều ngược lại với điều nó nói. */}
        <Slider value={[cao]} onValueChange={(v) => setCao((v as number[])[0] ?? cao)} min={480} max={1600} step={20} />
      </div>
      <dl className="grid max-w-md grid-cols-2 gap-x-6 gap-y-1 text-footnote">
        {[
          ['viewportHeight', cao],
          ['rowsTop', 220],
          ['footerHeight', 72],
          ['rowHeight', 52],
        ].map(([k, v]) => (
          <React.Fragment key={String(k)}>
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right tabular-nums">{v}</dd>
          </React.Fragment>
        ))}
        <dt className="font-medium">→ số mục</dt>
        <dd className="text-right font-medium tabular-nums">{so}</dd>
      </dl>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Toán THUẦN, không chạm DOM — nên nó test được, và đó là lý do nó tách khỏi hook. Lý do nó tồn
        tại: một thanh phân trang bị đẩy xuống dưới màn hình là một tính năng người dùng không tìm thấy.
      </p>
    </div>
  );
}

export function UseFitRowsDemo() {
  const topRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);
  const so = useFitRows({ topRef, footerRef, rowHeight: 40, min: 2, max: 12 });

  return (
    <div className="flex flex-col gap-3">
      <div ref={topRef} className="flex flex-col divide-y rounded-lg border">
        {Array.from({ length: so ?? 4 }, (_, i) => (
          <div key={i} className="flex h-10 items-center px-3 text-footnote text-muted-foreground">
            hàng {i + 1}
          </div>
        ))}
      </div>
      <div ref={footerRef} className="flex items-center justify-between rounded-lg border px-3 py-2">
        <span className="text-caption1 text-muted-foreground">
          vừa màn hình: <span className="tabular-nums">{so ?? '—'}</span> hàng
        </span>
        <span className="text-caption1 text-muted-foreground">trang 1 / 9</span>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Đổi chiều cao cửa sổ để thấy số hàng đổi theo. Phần quan trọng nhất của hook là{' '}
        <strong>chống rung</strong>: nó chỉ nhận số mới khi một đầu vào cứng đổi. Không có nó thì ngay
        tại biên vừa khít, số hàng dao động N ↔ N−1 vô tận — render N hàng làm trang có thanh cuộn,
        bề rộng hẹp lại, footer gãy dòng, tính lại ra N−1, hết thanh cuộn, về N… Người dùng thấy đúng
        một thứ: giật.
      </p>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Nó trả <code>null</code> cho tới lần đo đầu tiên; demo này dùng tạm 4 hàng trong lúc đó.
      </p>
    </div>
  );
}
