/**
 * Đăng ký DEMO cho trang showcase.
 *
 * Vì sao tự viết thay vì kéo `@shadcn/*-example`: những example đó import component nội bộ của site
 * shadcn (`@/app/(create)/components/icon-placeholder`) nên chúng không build được ở đây, mang class
 * riêng của site đó (`style-sera:*`), và có cả một mục "Custom Colors" dùng thẳng bảng màu Tailwind —
 * vi phạm đúng luật `no-tailwind-palette-colors` của hệ này. Vay chúng là vay cả ba vấn đề.
 *
 * Mỗi demo giữ THAM CHIẾU TRỰC TIẾP tới component, không giữ tên. Lý do: giải một tên thành module
 * lúc runtime cần `import()` đường dẫn động — Turbopack không làm được với đường dẫn tuỳ ý — nên sẽ
 * phải sinh thêm một file map, tức là thêm một thứ có thể lệch. Ở đây file nào demo cái gì thì import
 * đúng cái đó, và TypeScript bắt được ngay nếu component bị đổi tên.
 *
 * `variants` × `sizes` là hai trục mà phần lớn primitive có, nên một renderer chung dựng được ma trận
 * đầy đủ mà không cần một file riêng cho mỗi component. Component có HÀNH VI thật (bảng, dialog,
 * chồng thẻ) thì không: trạng thái dữ liệu và cử chỉ không phải là một trục prop. Chúng dùng `custom`
 * và một file demo riêng — `*-demo.tsx` bên cạnh file này.
 */
import type * as React from 'react';

import { Button } from '@/registry/base/button';
import { Badge } from '@/registry/base/badge';
import { Input } from '@/registry/base/input';
import { Textarea } from '@/registry/base/textarea';
import { Label } from '@/registry/base/label';
import { Skeleton } from '@/registry/base/skeleton';
import { Separator } from '@/registry/base/separator';
import { Spinner } from '@/registry/base/spinner';
import { Kbd } from '@/registry/base/kbd';
import { Switch } from '@/registry/base/switch';
import { Checkbox } from '@/registry/base/checkbox';
import { Toggle } from '@/registry/base/toggle';
import { EmptyState } from '@/registry/patterns/empty-state';
import { SearchInput } from '@/registry/patterns/search-input';
import { InfoTooltip } from '@/registry/patterns/info-tooltip';
import { DataTableDemo } from '@/registry/demos/data-table-demo';
import { CardDeckDemo } from '@/registry/demos/card-deck-demo';
import { ConfirmDialogDemo } from '@/registry/demos/confirm-dialog-demo';
import { MotionDemo } from '@/registry/demos/motion-demo';
import { TabSelectDemo } from '@/registry/demos/tab-select-demo';
import { ShellDemo } from '@/registry/demos/shell-demo';
import { ModeToggle } from '@/registry/patterns/mode-toggle';
import { RelativeTime } from '@/registry/patterns/relative-time';
import { Truncate } from '@/registry/base/truncate';

export type StateName = 'default' | 'hover' | 'focus-visible' | 'active' | 'disabled' | 'loading';

/** Sáu vi-trạng thái. Thiếu một là chỗ giao diện đọc ra "chưa xong". */
export const MICROSTATES: { name: StateName; note: string }[] = [
  { name: 'default', note: 'trạng thái nghỉ' },
  { name: 'hover', note: 'con trỏ ở trên — KHÔNG tồn tại trên thiết bị cảm ứng' },
  { name: 'focus-visible', note: 'điều hướng bằng BÀN PHÍM; không hiện khi bấm chuột' },
  { name: 'active', note: 'đang bị nhấn — xác nhận cú bấm đã được nhận' },
  { name: 'disabled', note: 'không dùng được, và phải nói được VÌ SAO' },
  { name: 'loading', note: 'đang xử lý — nói "đừng bấm nữa"' },
];

/** Sáu trạng thái DỮ LIỆU. Năm trong sáu cái này không xuất hiện khi dev chạy với dữ liệu mẫu. */
export const DATA_STATES = [
  { name: 'rỗng', note: 'chưa có gì — phải nói được bước tiếp theo, không chỉ "không có dữ liệu"' },
  { name: 'đang tải', note: 'skeleton khớp layout thật ở MỌI breakpoint' },
  { name: 'lỗi', note: 'nói chuyện gì sai và sửa thế nào' },
  { name: 'chữ dài tràn', note: 'luôn xảy ra với dữ liệu thật — phải truncate' },
  { name: 'số 0', note: 'khác với "chưa có dữ liệu", và thường bị render thành rỗng' },
  { name: 'số rất lớn', note: 'phá layout cột; cần tabular-nums và một ngưỡng rút gọn' },
] as const;

export type DemoSpec = {
  /** Component cho spec `variants × sizes`. Bỏ qua khi có `custom`. */
  component?: React.ComponentType<Record<string, unknown>>;
  /**
   * Demo tự viết, cho component có HÀNH VI thật — dialog, bảng, chồng thẻ. Spec `variants × sizes`
   * không diễn tả được chúng: trạng thái dữ liệu và cử chỉ không phải là một trục prop.
   */
  custom?: React.ComponentType;
  variants?: { prop: string; values: string[] };
  sizes?: { prop: string; values: string[] };
  props?: Record<string, unknown>;
  children?: React.ReactNode;
  /** Sáu vi-trạng thái có áp dụng được cho component này không. */
  microstates?: boolean;
  /** Ghi chú hiện trên trang — để NÓI RA quyết định thiết kế, không để mô tả code. */
  note?: string;
};

/**
 * CÒN THIẾU phần lớn trong 55 primitive, và đó là nợ đã biết chứ không phải nhầm — trang component
 * tự hiện "chưa có demo" cho những cái thiếu, nên nợ này nhìn thấy được thay vì âm thầm.
 */
export const DEMOS: Record<string, DemoSpec> = {
  button: {
    component: Button,
    variants: { prop: 'variant', values: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] },
    sizes: { prop: 'size', values: ['xs', 'sm', 'default', 'lg'] },
    children: 'Lưu thay đổi',
    microstates: true,
    note: 'Nhãn trên nút primary là ink (--primary-foreground), không phải trắng. Trắng-trên-clay đo 3.12:1 — dưới sàn 4.5:1 cho chữ. Nút giữ đúng mã thương hiệu, nhãn đổi màu.',
  },
  badge: {
    component: Badge,
    variants: { prop: 'variant', values: ['default', 'secondary', 'destructive', 'outline', 'ghost'] },
    children: 'Đang học',
    note: 'Badge là CHỮ, nên nó chịu sàn 4.5:1 chứ không phải 3:1 — kể cả khi nó trông như một phần tử đồ hoạ.',
  },
  input: {
    component: Input,
    props: { placeholder: 'Tìm từ vựng…', className: 'w-56' },
    microstates: true,
    note: 'Viền ô nhập dùng --input ở bậc 9/10, không phải bậc 7. Bậc 7 đo 1.43:1 — gần như vô hình, và là một lỗi tiếp cận thật thừa hưởng từ sakubun. Viền của một CONTROL chịu sàn 3:1; đường kẻ trang trí thì không.',
  },
  textarea: {
    component: Textarea,
    props: { placeholder: 'Ghi chú…', className: 'w-56' },
    microstates: true,
  },
  label: { component: Label, children: 'Cấp độ JLPT' },
  skeleton: {
    component: Skeleton,
    props: { className: 'h-5 w-40' },
    note: 'Skeleton tồn tại để GIỮ layout, không phải để báo đang tải. Một skeleton không khớp trang thật thì tệ hơn không có skeleton.',
  },
  separator: { component: Separator, props: { className: 'w-40' } },
  spinner: { component: Spinner },
  kbd: { component: Kbd, children: '⌘K' },
  switch: { component: Switch, microstates: true },
  checkbox: { component: Checkbox, microstates: true },
  toggle: { component: Toggle, children: 'Đã thuộc', microstates: true },

  // ── pattern (pha 4) ──
  'empty-state': {
    component: EmptyState as React.ComponentType<Record<string, unknown>>,
    props: {
      title: 'Chưa có thuật ngữ nào',
      description: 'Thêm mục đầu tiên để bắt đầu.',
      className: 'w-full',
    },
    note: 'Dựng TRÊN `Empty` của shadcn, không dựng lại — luật reuse-before-build. Hai icon mang hai nghĩa khác nhau: Inbox = chưa có gì (trang nên giấu cả thanh công cụ), SearchX = có dữ liệu nhưng bộ lọc không khớp (PHẢI giữ thanh công cụ, nếu không người dùng mắc kẹt).',
  },
  'search-input': {
    component: SearchInput as React.ComponentType<Record<string, unknown>>,
    props: { placeholder: 'Tìm thuật ngữ…' },
    microstates: true,
    note: 'Bề rộng dùng CONTAINER QUERY, không viewport. Ô này hay nằm trong toolbar hẹp, trong dialog, trong một cột grid — theo viewport thì nó tràn khỏi hộp chứa dù hộp chỉ 300px.',
  },
  'info-tooltip': {
    component: InfoTooltip as React.ComponentType<Record<string, unknown>>,
    props: { text: 'Số lượt ôn đã hoàn thành của mục này.' },
    note: 'Là một <button> thật chứ không phải span có icon — span không nhận focus bàn phím, nên lời giải thích sẽ không tồn tại với người không dùng chuột. Vùng chạm phủ 44px mà không phóng to phần nhìn thấy.',
  },
  'data-table': {
    custom: DataTableDemo,
    note: 'Chỗ DUY NHẤT sáu trạng thái dữ liệu được render thật chứ không chỉ liệt kê. Bấm từng trạng thái ở trên bảng.',
  },
  'card-deck': {
    custom: CardDeckDemo,
    note: 'Phản hồi theo NGÓN TAY: thẻ đi theo con trỏ ngay, không chờ ngưỡng. Chờ ngưỡng làm cử chỉ cảm giác như bị trễ dù tổng thời gian bằng nhau.',
  },
  motion: {
    custom: MotionDemo,
    note: 'Tầng cảm giác, VAY từ @seamui/motion qua quy trình khu cách ly năm bước. Đã tái-token-hoá: mọi thời lượng và easing ánh xạ vào thang của thienui, không giữ số của seam. Cổng no-raw-durations bắt được đúng ba dòng cần sửa khi nó còn trong khu cách ly.',
  },
  'tab-select': {
    custom: TabSelectDemo,
    note: 'Ba lỗi của nó chỉ tồn tại được vì nó CHƯA TỪNG được render: crash vì thiếu <Tabs>, container query đặt trên một phần tử display:contents nên không có container nào, và ô select in ra value thay vì nhãn. Thu một component vào registry không chứng minh nó chạy.',
  },
  'page-shell': {
    custom: ShellDemo,
    note: 'Trang thật và khung chờ đứng cạnh nhau — chúng tồn tại để KHÔNG lệch nhau, nên đó là phép kiểm duy nhất có nghĩa. Prop `title`/`description` được thêm ở pha 6: một "page shell" không có chỗ đặt <h1> thì mỗi trang tự gõ lại chuỗi class của mình, và chúng trôi.',
  },
  'mode-toggle': {
    component: ModeToggle as React.ComponentType<Record<string, unknown>>,
    note: 'Theme sinh ra cả khối .dark nhưng trước pha 6 không item nào bật được nó. Phần khó là MODE_SCRIPT trong <head>: áp chế độ sau khi hydrate thì lần sơn đầu luôn sai rồi nháy, và không useEffect nào sửa được vì nó chạy sau khi trình duyệt đã vẽ.',
  },
  'relative-time': {
    component: RelativeTime as React.ComponentType<Record<string, unknown>>,
    props: {
      value: '2026-10-04T09:00:00+07:00',
      format: (d: Date) => new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' }).format(
        Math.round((d.getTime() - Date.parse('2026-10-05T09:00:00+07:00')) / 86_400_000), 'day'),
      exact: (d: Date) => d.toLocaleString('vi-VN'),
    },
    note: 'Không mang theo cách viết tiếng Việt — `format` và `exact` là prop. Component UI không nên quyết định ngôn ngữ; cái giá là mỗi app phải có một file định dạng, và đó là cái giá đúng.',
  },
  truncate: {
    component: Truncate as React.ComponentType<Record<string, unknown>>,
    props: { className: 'w-56' },
    children: 'Sữa tươi tiệt trùng Vinamilk có đường 180ml',
    note: 'Chữ dài là trạng thái dữ liệu thứ tư, và nó LUÔN xảy ra với dữ liệu thật. Cắt chữ mà không cho đọc đủ thì chỉ đổi một lỗi layout thành một lỗi thông tin — nên bản đầy đủ nằm trong tooltip.',
  },
  'confirm-dialog': {
    custom: ConfirmDialogDemo,
    note: '`pending` khoá MỌI ĐƯỜNG RA. Pha 6 đo được rằng khoá hai nút là chưa đủ — hộp vẫn đóng được bằng Esc, bằng nút ×, và bằng bấm ra ngoài. Nay cả ba bị chặn ở `onOpenChange`, một cửa duy nhất, nên không quên được đường thứ tư. Lý do gốc: bấm Huỷ giữa chừng một thao tác đã gửi đi sẽ đóng modal trong khi việc vẫn chạy, và người dùng mất chỗ duy nhất để biết kết quả.',
  },
};

export const hasDemo = (name: string) => name in DEMOS;
