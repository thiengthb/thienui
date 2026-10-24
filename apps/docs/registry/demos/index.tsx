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
import {
  AlertDialogDemo, CommandDemo, ContextMenuDemo, DialogDemo, DrawerDemo, DropdownMenuDemo,
  HoverCardDemo, MenubarDemo, PopoverDemo, SheetDemo,
} from '@/registry/demos/overlay-demos';
import { TooltipDemo } from '@/registry/demos/tooltip-demo';
import { MotionTokensDemo } from '@/registry/demos/motion-tokens-demo';
import {
  ButtonGroupDemo, CalendarDemo, ComboboxDemo, FieldDemo, InputGroupDemo, InputOtpDemo,
  NativeSelectDemo, RadioGroupDemo, SelectDemo, SliderDemo,
} from '@/registry/demos/form-demos';
import {
  AlertDemo, AspectRatioDemo, AvatarDemo, CardDemo, CarouselDemo, ChartDemo, EmptyDemo, ItemDemo,
  ProgressDemo, ResizableDemo, ScrollAreaDemo, TableDemo,
} from '@/registry/demos/display-demos';
import {
  AccordionDemo, BreadcrumbDemo, CollapsibleDemo, NavigationMenuDemo, PaginationDemo, SidebarDemo,
  TabsDemo, ToggleGroupDemo,
} from '@/registry/demos/nav-demos';
import {
  FitRowsDemo, SonnerDemo, ToastDemo, UseFitRowsDemo, UseIsMobileDemo,
} from '@/registry/demos/feedback-demos';
import {
  AppShellDemo, AppSidebarDemo, BulkActionDemo, ExplainDemo, PageChromeDemo, PageSkeletonDemo,
  PressableDemo,
} from '@/registry/demos/shell-extra-demos';
import { BottomNavDemo, StatDemo } from '@/registry/demos/stat-nav-demos';

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

  // ── lớp nổi ──
  dialog: { custom: DialogDemo, note: 'Một dialog chỉ tồn tại khi có người mở, nên trạng thái đáng xem nhất của nó không phải lúc nó là một cái nút. Tab bị giữ lại trong hộp — đó là focus trap, và là lý do không tự dựng modal bằng div.' },
  'alert-dialog': { custom: AlertDialogDemo, note: 'Khác Dialog đúng một chỗ: KHÔNG đóng được bằng bấm ra ngoài. Một việc không hoàn lại được thì không nên lỡ tay thoát khỏi.' },
  sheet: { custom: SheetDemo, note: 'Dùng cho việc PHỤ chạy song song với trang — bộ lọc, chi tiết. Việc phải quyết xong mới đi tiếp thì dùng Dialog.' },
  drawer: { custom: DrawerDemo, note: 'Dạng dành cho ĐIỆN THOẠI: kéo được bằng ngón tay. Trên màn rộng thì Sheet hoặc Dialog đúng hơn.' },
  popover: { custom: PopoverDemo, note: 'Chứa được control bấm vào — khác Tooltip, thứ chỉ được chứa chữ. Ranh giới đó không phải thẩm mỹ: tooltip không giữ được focus.' },
  'hover-card': { custom: HoverCardDemo, note: 'Chỉ mở bằng CON TRỎ, nên nội dung trong nó phải là thứ không bắt buộc. Thiết bị cảm ứng không có hover, và đó không phải trường hợp hiếm.' },
  tooltip: { custom: TooltipDemo, note: 'Chỉ chứa CHỮ, và chữ đó luôn là phần thêm — không bao giờ là thông tin duy nhất. Tab tới cũng phải mở được, nếu không nó không tồn tại với người không dùng chuột.' },
  'context-menu': { custom: ContextMenuDemo, note: 'Menu chuột phải là LỐI TẮT, không bao giờ là lối duy nhất: không có gì trên màn hình nói rằng nó tồn tại.' },
  'dropdown-menu': { custom: DropdownMenuDemo, note: 'Mũi tên đi trong menu, chữ cái đầu nhảy tới mục. Đó là hành vi có sẵn, và là lý do không tự dựng menu bằng div + onClick.' },
  menubar: { custom: MenubarDemo, note: 'Mở một menu rồi rê ngang thì các menu khác mở theo. Đó là thứ phân biệt một menubar thật với bốn dropdown đặt cạnh nhau.' },
  command: { custom: CommandDemo, note: '`CommandEmpty` là trạng thái "lọc không khớp", khác hẳn "chưa có dữ liệu" — hai thứ này bị gộp làm một ở hầu hết app, và người dùng mắc kẹt vì nó.' },

  // ── nhập liệu ──
  select: { custom: SelectDemo, note: 'Prop `items` là thứ ánh xạ value → nhãn. Thiếu nó thì ô hiện ra chính value — đúng lỗi mà `tab-select` dính ở pha 6.' },
  'native-select': { custom: NativeSelectDemo, note: '`<select>` THẬT: trên điện thoại nó mở bộ chọn của hệ điều hành, quen tay hơn và không tốn dòng JS nào. Dùng nó khi không cần tìm kiếm.' },
  combobox: { custom: ComboboxDemo, note: 'Chỉ đáng dùng khi danh sách đủ dài để cuộn thành việc. Dưới mười mục thì Select nhanh hơn — gõ là thêm việc, không bớt.' },
  'radio-group': { custom: RadioGroupDemo, note: 'Một nhóm radio là MỘT điểm dừng của Tab, không phải bốn. Mũi tên đổi lựa chọn bên trong nhóm.' },
  slider: { custom: SliderDemo, note: 'Luôn hiện SỐ bên cạnh. Một slider không có số là một control mà người dùng không nói lại được họ vừa chọn gì.' },
  'input-otp': { custom: InputOtpDemo, note: 'Dán cả mã vào một ô thì nó tự rải ra các ô. Không có điều đó, người dùng phải gõ lại tay từng số — và đó là lúc họ gõ sai.' },
  field: { custom: FieldDemo, note: 'Nhãn, mô tả và lỗi được NỐI với input bằng id, không chỉ đặt gần nhau. Đó là khác biệt giữa một form dùng được bằng bàn phím và một form trông giống form.' },
  'input-group': { custom: InputGroupDemo, note: 'Phần phụ nằm TRONG viền ô. Hai hộp dán cạnh nhau sẽ lệch chiều cao ngay khi một bên có trạng thái lỗi.' },
  'button-group': { custom: ButtonGroupDemo, note: 'Bo góc chỉ ở hai đầu, viền giữa gộp làm một — đó là thứ nói "một control có nhiều nhánh", khác hẳn mấy cái nút đặt gần nhau.' },
  calendar: { custom: CalendarDemo, note: 'Locale quyết định thứ bắt đầu tuần. Để mặc định tiếng Anh là lịch bắt đầu từ Chủ nhật — sai với phần lớn người dùng Việt, và không ai báo lỗi.' },

  // ── hiển thị ──
  card: { custom: CardDemo, note: 'Tiêu đề dài là trạng thái dữ liệu thứ tư và nó luôn tới. Ở đây nó bị cắt chứ không đẩy `CardAction` rơi xuống dòng.' },
  item: { custom: ItemDemo, note: 'Một hàng danh sách có media + nội dung + hành động. Dùng nó thay vì tự ghép flex, để ba chỗ khác nhau trong app không ra ba chiều cao hàng khác nhau.' },
  empty: { custom: EmptyDemo, note: 'Primitive trần. Bản đã mang sẵn hai nghĩa "chưa có gì" và "lọc không khớp" là `@thienui/empty-state`.' },
  alert: { custom: AlertDemo, note: 'Mô tả phải nói SỬA THẾ NÀO, không chỉ nói có lỗi. "Đã có lỗi xảy ra" là một câu không ai làm gì được với nó.' },
  avatar: { custom: AvatarDemo, note: 'Fallback là CHỮ CÁI ĐẦU chứ không phải một icon người chung chung: hai người không ảnh vẫn phải phân biệt được.' },
  progress: { custom: ProgressDemo, note: '0% phải nhìn ra là 0%, không phải "chưa tải xong". Đó là trạng thái hay bị render thành một thanh rỗng trông y hệt lỗi.' },
  chart: { custom: ChartDemo, note: 'Màu lấy từ --chart-1…5, không lấy từ bảng mặc định của recharts — nếu không, biểu đồ là thứ duy nhất trên trang không đổi theo theme.' },
  table: { custom: TableDemo, note: 'Số căn PHẢI và dùng tabular-nums. Bảng có sắp xếp, chọn dòng và sáu trạng thái dữ liệu là `@thienui/data-table`.' },
  'aspect-ratio': { custom: AspectRatioDemo, note: 'Giữ chỗ TRƯỚC khi ảnh về. Không có nó thì mỗi ảnh tải xong là một lần layout nhảy, và người đang đọc mất dòng.' },
  'scroll-area': { custom: ScrollAreaDemo, note: 'Thanh cuộn tự vẽ nên giống nhau trên mọi hệ điều hành — macOS tự ẩn thanh cuộn, Windows thì không, và bố cục lệch khoảng 15px giữa hai bên.' },
  resizable: { custom: ResizableDemo, note: 'Tay nắm kéo được bằng BÀN PHÍM nữa. Một tay nắm chỉ kéo được bằng chuột là một bố cục mà người không dùng chuột không chỉnh được.' },
  carousel: { custom: CarouselDemo, note: 'Nút trước/sau tự disabled ở hai đầu — đó là cách duy nhất người dùng biết mình đã tới cuối mà không phải thử.' },

  // ── điều hướng ──
  accordion: { custom: AccordionDemo, note: 'Chiều cao chạy mượt vì nội dung được ĐO thật, không phải một max-height đoán sẵn — thứ luôn sai với câu trả lời dài.' },
  collapsible: { custom: CollapsibleDemo, note: 'Một cặp mở/đóng trần, không quản nhóm. Dùng nó khi chỉ có MỘT thứ để giấu; nhiều thứ thì dùng Accordion.' },
  tabs: { custom: TabsDemo, note: 'Tab nhảy THẲNG vào nội dung của tab đang chọn, không đi qua từng cái tab. Cần thu thành select khi hẹp thì dùng `@thienui/tab-select`.' },
  breadcrumb: { custom: BreadcrumbDemo, note: 'Mục cuối là BreadcrumbPage chứ không phải link — một link trỏ về chính trang hiện tại là một lời hứa giả.' },
  pagination: { custom: PaginationDemo, note: 'Luôn hiện trang CUỐI: nó là thứ duy nhất nói tổng cộng có bao nhiêu. Số mục mỗi trang nên đo theo màn hình — xem `use-fit-rows`.' },
  'navigation-menu': { custom: NavigationMenuDemo, note: 'Đây là ĐIỀU HƯỚNG (mục là link, mở tab mới được), còn dropdown là HÀNH ĐỘNG. Trình đọc màn hình đọc hai thứ đó khác nhau.' },
  'toggle-group': { custom: ToggleGroupDemo, note: 'Chọn-một và chọn-nhiều trông giống hệt nhau nhưng là hai lời hứa khác nhau. Khi chỉ có icon thì aria-label là thứ duy nhất nói nút đó làm gì.' },
  sidebar: { custom: SidebarDemo, note: 'Primitive trần. Ở dạng icon, nhãn biến thành tooltip — nếu không thì các mục trở thành một cột biểu tượng không ai đoán được. Bản đã ghép là `@thienui/app-sidebar`.' },

  // ── phản hồi & tiện ích ──
  toast: { custom: ToastDemo, note: 'Bề mặt duy nhất trong hệ TỰ BIẾN MẤT. Nút "Hoàn tác" trong toast là lý do chính để dùng nó thay cho hộp xác nhận — nhưng lỗi cần xử lý thì không được chỉ nằm ở đây.' },
  sonner: { custom: SonnerDemo, note: 'Hai bộ toast cùng có trong registry là CÓ CHỦ Ý, không phải trùng. Chọn một và dùng một: hai hệ toast trong một app nghĩa là hai vị trí, hai thời lượng, hai kiểu xếp chồng.' },
  'use-mobile': { custom: UseIsMobileDemo, note: 'Viewport query thật, nên chỉ dùng cho quyết định VỀ CẢ MÀN HÌNH. Mọi thứ bên trong một component thì dùng container query — component không biết nó được đặt vào hộp rộng bao nhiêu.' },
  'fit-rows': { custom: FitRowsDemo, note: 'Toán THUẦN, không chạm DOM — nên nó test được, và đó là lý do nó tách khỏi hook.' },
  'use-fit-rows': { custom: UseFitRowsDemo, note: 'Phần quan trọng nhất là CHỐNG RUNG. Không có nó thì ngay tại biên vừa khít, số hàng dao động N ↔ N−1 vô tận, và người dùng thấy đúng một thứ: giật.' },

  // ── pattern & shell còn lại ──
  'bulk-action-button': { custom: BulkActionDemo, note: 'Dock tự ẩn khi count = 0 — một thanh hành động luôn hiện nhưng luôn mờ là một thanh người dùng học cách bỏ qua.' },
  explain: { custom: ExplainDemo, note: 'Dùng cho con số mà người nhìn lần thứ mười vẫn không chắc nó đếm cái gì. Phần tử được giải thích là chính con số, không phải một dấu hỏi đặt cạnh.' },
  pressable: { custom: PressableDemo, note: 'Thêm cảm giác từ BÊN NGOÀI thay vì sửa chính cái nút, vì registry/base/** là ranh giới vendor: shadcn add sẽ ghi đè mọi sửa đổi trong đó, âm thầm, trong khi test vẫn xanh.' },
  'app-shell': { custom: AppShellDemo, note: '`renderLink` là lý do khung này nối được với router của bất kỳ framework nào mà không cần biết framework đó tồn tại.' },
  'app-sidebar': { custom: AppSidebarDemo, note: 'Badge nằm cạnh nhãn chứ không chồng lên icon: chồng lên icon thì khi sidebar thu còn icon, con số che mất chính thứ nó đang đếm.' },
  'page-skeleton': { custom: PageSkeletonDemo, note: 'Skeleton tồn tại để GIỮ layout, không phải để báo đang tải. Các cờ hasAside / hasBreadcrumb / hasDescription không phải tuỳ chọn thẩm mỹ — chúng phải khớp với trang thật.' },
  'motion-tokens': { custom: MotionTokensDemo, note: 'File DỮ LIỆU sinh tự động, không phải component — nhưng vẫn là chỗ duy nhất đọc được giá trị THẬT của tầng cảm giác dưới dạng số. Nó tồn tại vì spring là SỐ, thứ CSS không mang được, và vì khai một dependency npm chưa publish làm `shadcn add` chết cả lô ở project ngoài.' },
  stat: { custom: StatDemo, note: 'Cỡ icon, cỡ số và chỗ đặt lời giải thích do component quyết định. Một lưới số liệu dựng tay là nơi app lệch cỡ nhanh nhất.' },
  'bottom-nav': { custom: BottomNavDemo, note: 'Cùng kiểu `NavItem` với AppSidebar, để hai thanh điều hướng đọc chung một danh sách mục. Ẩn từ `md`, nơi sidebar thay chỗ.' },
  'page-chrome': { custom: PageChromeDemo, note: 'Không có component nào ở đây, chỉ là chuỗi class — và đó là cả ý nghĩa của nó. PageShell và PageSkeleton IMPORT chung chúng thay vì chép nhau; ở sakubun chép nhau rồi lệch 41px.' },
};

export const hasDemo = (name: string) => name in DEMOS;
