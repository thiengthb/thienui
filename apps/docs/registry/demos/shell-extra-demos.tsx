'use client';

/**
 * Demo cho tầng `patterns/` và `shells/` còn lại: dock hành động hàng loạt, bong bóng giải thích,
 * độ sâu khi nhấn, khung app, và các khung chờ.
 *
 * Chúng là code TA VIẾT, không phải vendor — nên mỗi demo ở đây cũng là chỗ kiểm xem cái lý do viết
 * ra chúng có còn đúng không.
 */
import * as React from 'react';
import { Archive, Boxes, Download, Home, Settings, Star, Trash2 } from 'lucide-react';

import { Button } from '@/registry/base/button';
import { Skeleton } from '@/registry/base/skeleton';
import { AppShell } from '@/registry/shells/app-shell';
import { AppLogo, AppSidebar, type NavGroup } from '@/registry/shells/app-sidebar';
import {
  PAGE_DESCRIPTION,
  PAGE_HEADER_ASIDE,
  PAGE_HEADER_ROW,
  PAGE_ROOT,
  PAGE_TITLE,
  PAGE_WIDTH,
} from '@/registry/shells/page-chrome';
import { CardGridSkeleton, PageSkeleton, TableSkeleton } from '@/registry/shells/page-skeleton';
import { BulkActionButton, BulkActionDock } from '@/registry/patterns/bulk-action-button';
import { Explain } from '@/registry/patterns/explain';
import { Pressable } from '@/registry/patterns/pressable';

export function BulkActionDemo() {
  const [chon, setChon] = React.useState(3);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {[0, 1, 3, 128].map((n) => (
          <Button key={n} size="sm" variant="outline" onClick={() => setChon(n)}>
            chọn {n}
          </Button>
        ))}
      </div>

      <div className="relative flex min-h-32 items-start rounded-lg border border-dashed p-4">
        <BulkActionDock count={chon}>
          <BulkActionButton icon={<Star />} label="Đánh dấu" />
          <BulkActionButton icon={<Archive />} label="Lưu trữ" />
          <BulkActionButton icon={<Download />} label="Xuất .csv" />
          <BulkActionButton icon={<Trash2 />} label="Xoá" variant="destructive" />
        </BulkActionDock>
      </div>

      <p className="max-w-prose text-caption1 text-muted-foreground">
        Dock tự ẩn khi <code>count</code> bằng 0 — một thanh hành động luôn hiện nhưng luôn mờ là một
        thanh người dùng học cách bỏ qua. Mỗi nút chỉ có icon, nên <code>label</code> vừa là tooltip
        vừa là tên cho trình đọc màn hình: <strong>một chuỗi, hai việc</strong>, nên chúng không lệch
        nhau được.
      </p>
    </div>
  );
}

export function ExplainDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <Explain text="Tỉ lệ thẻ bạn nhớ đúng ở lần ôn đầu tiên trong ngày, tính trên 7 ngày gần nhất.">
          <span className="border-b border-dotted text-footnote">Tỉ lệ nhớ · 86%</span>
        </Explain>

        <Explain
          side="right"
          text="Khoảng cách tới lần ôn kế tiếp do FSRS tính, không phải do bạn đặt. Ôn sớm hơn không làm nó dài ra."
        >
          <span className="border-b border-dotted text-footnote">Hẹn lại · 12 ngày</span>
        </Explain>
      </div>

      <p className="max-w-prose text-caption1 text-muted-foreground">
        Dùng cho con số mà người nhìn lần thứ mười vẫn không chắc nó đếm cái gì. Khác{' '}
        <code>Tooltip</code> trần ở chỗ nó buộc có nội dung GIẢI THÍCH, và khác{' '}
        <code>InfoTooltip</code> ở chỗ phần tử được giải thích là chính con số, không phải một dấu
        hỏi đặt cạnh.
      </p>
    </div>
  );
}

export function PressableDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Pressable>
          <Button>Có độ sâu</Button>
        </Pressable>
        <Button variant="outline">Không có</Button>
        <Pressable disabled>
          <Button variant="secondary">Đã tắt</Button>
        </Pressable>
      </div>

      <p className="max-w-prose text-caption1 text-muted-foreground">
        Nhấn và GIỮ để thấy khác biệt — nó lún xuống rồi bật về theo spring, không phải theo một
        <code> transition</code> tuyến tính. Khác biệt nhỏ tới mức khó chỉ ra, nhưng đó đúng là chỗ
        cảm giác “bấm vào có gì đó” đến từ.
      </p>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Thêm cảm giác từ BÊN NGOÀI thay vì sửa chính cái nút, vì <code>registry/base/**</code> là ranh
        giới vendor — <code>shadcn add</code> sẽ ghi đè mọi sửa đổi trong đó, âm thầm, trong khi test
        vẫn xanh. <strong>Đừng dùng cho item trong composite của Base UI</strong> (Toolbar,
        ToggleGroup, Tabs, Menubar): chúng đăng ký qua ref và một lớp bọc sẽ phá đăng ký.
      </p>
    </div>
  );
}

const NHOM: readonly NavGroup[] = [
  {
    label: 'Học',
    items: [
      { href: '/', label: 'Phiên hôm nay', icon: Home, badge: 24 },
      { href: '/thu-vien', label: 'Thư viện', icon: Boxes },
    ],
  },
  { items: [{ href: '/cai-dat', label: 'Cài đặt', icon: Settings }] },
];

export function AppShellDemo() {
  const [duong, setDuong] = React.useState('/');
  return (
    <div className="flex flex-col gap-3">
      <div className="h-96 overflow-hidden rounded-lg border">
        <AppShell
          className="min-h-full"
          topBar={<span className="text-caption1 text-muted-foreground">thanh trên của app</span>}
          sidebar={
            <AppSidebar
              groups={NHOM}
              isActive={(href) => href === duong}
              renderLink={(href, kids) => (
                <button type="button" onClick={() => setDuong(href)}>
                  {kids}
                </button>
              )}
              header={<AppLogo mark={<Boxes className="size-4" />} name="Sakubun" />}
            />
          }
        >
          <div className="p-6 text-footnote text-muted-foreground">
            Đang ở <code>{duong}</code>. Bấm nút thu/mở ở thanh trên, hoặc bấm một mục bên trái.
          </div>
        </AppShell>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        <code>renderLink</code> là lý do khung này nối được với router của bất kỳ framework nào mà
        không cần biết framework đó tồn tại — ở demo này nó là một <code>&lt;button&gt;</code>, trong
        một app Next thì là <code>&lt;Link&gt;</code>. Nếu nó tự <code>import</code> next/link thì cả
        registry chỉ dùng được trong Next.
      </p>
    </div>
  );
}

export function AppSidebarDemo() {
  const [duong, setDuong] = React.useState('/thu-vien');
  return (
    <div className="flex flex-col gap-3">
      <div className="h-80 overflow-hidden rounded-lg border">
        <AppShell
          className="min-h-full"
          sidebar={
            <AppSidebar
              groups={NHOM}
              isActive={(href) => href === duong}
              renderLink={(href, kids) => (
                <button type="button" onClick={() => setDuong(href)}>
                  {kids}
                </button>
              )}
              header={<AppLogo mark={<Boxes className="size-4" />} name="Sakubun" />}
              footer={<span className="text-caption1 text-muted-foreground">thien@sakubun.app</span>}
            />
          }
        >
          <div className="p-6 text-footnote text-muted-foreground">
            Mục đang mở: <code>{duong}</code>
          </div>
        </AppShell>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        <code>badge</code> là một SỐ, và nó nằm cạnh nhãn chứ không chồng lên icon: chồng lên icon thì
        khi sidebar thu còn icon, con số che mất chính thứ nó đang đếm.
      </p>
    </div>
  );
}

export function PageSkeletonDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border px-6">
        <PageSkeleton hasAside hasDescription>
          <TableSkeleton rows={4} columns={4} />
        </PageSkeleton>
      </div>
      <div className="rounded-lg border px-6">
        <PageSkeleton hasBreadcrumb>
          <CardGridSkeleton count={3} />
        </PageSkeleton>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Skeleton tồn tại để <strong>GIỮ layout</strong>, không phải để báo đang tải. Một skeleton không
        khớp trang thật thì tệ hơn không có skeleton: nội dung về, layout nhảy, người đang đọc mất chỗ.
        Nên các cờ <code>hasAside</code> / <code>hasBreadcrumb</code> / <code>hasDescription</code>{' '}
        không phải tuỳ chọn thẩm mỹ — chúng phải khớp với trang thật.
      </p>
    </div>
  );
}

const HANG: [string, string, string][] = [
  ['PAGE_ROOT', PAGE_ROOT, 'padding dọc và nhịp dọc của cả trang'],
  ['PAGE_HEADER_ROW', PAGE_HEADER_ROW, 'hàng tồn tại trên MỌI trang — lệch ở đây là nhảy ở mọi lần điều hướng'],
  ['PAGE_HEADER_ASIDE', PAGE_HEADER_ASIDE, 'ghim phải chỉ khi hẹp'],
  ['PAGE_TITLE', PAGE_TITLE, 'chuỗi class của <h1>'],
  ['PAGE_DESCRIPTION', PAGE_DESCRIPTION, 'dòng mô tả dưới tiêu đề'],
];

export function PageChromeDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-caption1">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-2.5 font-medium text-muted-foreground">hằng số</th>
              <th className="p-2.5 font-medium text-muted-foreground">giá trị</th>
              <th className="p-2.5 font-medium text-muted-foreground">để làm gì</th>
            </tr>
          </thead>
          <tbody>
            {HANG.map(([ten, gt, note]) => (
              <tr key={ten} className="border-b last:border-0 align-top">
                <td className="p-2.5">
                  <code>{ten}</code>
                </td>
                <td className="p-2.5">
                  <code className="text-muted-foreground">{gt || '—'}</code>
                </td>
                <td className="p-2.5 text-muted-foreground">{note}</td>
              </tr>
            ))}
            {Object.entries(PAGE_WIDTH).map(([k, v]) => (
              <tr key={k} className="border-b last:border-0 align-top">
                <td className="p-2.5">
                  <code>PAGE_WIDTH.{k}</code>
                </td>
                <td className="p-2.5">
                  <code className="text-muted-foreground">{v || '— (thừa hưởng bề rộng shell)'}</code>
                </td>
                <td className="p-2.5 text-muted-foreground">bậc bề rộng nội dung</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-56" />
        <span className="text-caption1 text-muted-foreground">
          chiều cao khối tiêu đề mà <code>PageSkeleton</code> phải khớp
        </span>
      </div>
      <p className="max-w-prose text-caption1 text-muted-foreground">
        Không có component nào ở đây — chỉ là chuỗi class, và đó là cả ý nghĩa của nó.{' '}
        <code>PageShell</code> và <code>PageSkeleton</code> <strong>import</strong> chung những hằng
        số này thay vì chép nhau. Ở sakubun hai file chép nhau rồi lệch: placeholder thanh trên di
        động bị thiếu, nên dưới <code>md</code> breadcrumb nhảy ~41px mỗi lần điều hướng, trên mọi
        trang. Một bài test bắt được lệch sau khi nó xảy ra; một hằng số dùng chung làm lệch không
        xảy ra được.
      </p>
    </div>
  );
}
