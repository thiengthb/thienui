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
 * đầy đủ mà không cần một file riêng cho mỗi component. Component compound (Progress, Dialog,
 * Combobox, Calendar) không khai được bằng spec này — chúng cần render riêng, và chưa có.
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
  component: React.ComponentType<Record<string, unknown>>;
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
};

export const hasDemo = (name: string) => name in DEMOS;
