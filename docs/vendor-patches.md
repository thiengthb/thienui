# Patch trên code vendor

`apps/docs/registry/base/**` là code vendor, kéo từ registry shadcn bằng `shadcn add`. Lệnh đó **ghi
đè file**. Mọi sửa tay ở đó sẽ mất ở lần cập nhật vendor tiếp theo — và mất âm thầm, vì test vẫn xanh.

File này là nơi ghi lại các patch đã chủ ý áp, để lần `shadcn add` sau còn biết phải áp lại gì.

## Vì sao có file này

Trong lúc dựng pha 2 (2026-10-04), bản sửa `text-[0.8rem]` → `text-footnote` ở `button.tsx` bị xoá
đúng như vậy sau hai lô thêm component. Không có gì báo. Đó là lý do luật `base-is-vendor` tồn tại.

## Quy trình

1. Chỉ patch khi đó là **một quyết định thiết kế thật**, không phải để làm một luật văn phong im tiếng
   — bảy luật văn phong đã được `exclude` khỏi `base/**` chính vì lý do này.
2. Ghi vào bảng dưới: file · chỗ sửa · trước → sau · vì sao.
3. Sau mỗi lần `shadcn add` trong `base/`, chạy lại `pnpm guards` rồi đối chiếu bảng này.

## Quyết định đã đảo ngược

| quyết định | đảo ngày | vì sao |
|---|---|---|
| Ghim `@tanstack/react-table@^8` (pha 4) | 2026-10-05, pha 5 | Lý do đã viết ra — "`@niko-table` và `@data-table-filters` đều nhắm v8" — **không đúng**. Kiểm lại thì cả hai khai `@tanstack/react-table@^9`. Lập luận duy nhất chống đỡ cho v8 là một sự thật sai, trong khi nó có hai cái giá đã biết: React Compiler bỏ qua component, và cánh cửa vay thì đóng. Sau khi lên v9, cảnh báo "Compilation Skipped" biến mất. |

Bài học giữ lại: **lý do đã viết ra vẫn có thể sai.** Nó chỉ lộ khi có người đi kiểm cái nguồn mà nó
viện dẫn — ở đây là lúc thật sự mở `@niko-table` ra xem, chứ không phải lúc viết lý do.

## Bảng patch

| file | chỗ | trước → sau | vì sao | ngày |
|---|---|---|---|---|
| `button.tsx`, `toggle.tsx`, `tabs.tsx` (`TabsTrigger`) | chuỗi class gốc | thêm `target-44` | Vùng bấm 44px trên màn cảm ứng mà không phóng to nút (luật `touch-target-44`). Không làm được từ ngoài vendor: bọc mọi nút trong một lớp nữa thì chỗ gọi phải nhớ dùng lớp bọc, và chỗ quên chính là chỗ nút bị phóng to lại. Cái giá rơi xuống người dùng điện thoại, nên đạt tiêu chuẩn patch bên dưới. Sau `shadcn add` vào ba file này, `pnpm guards` sẽ đỏ cho tới khi áp lại. | 2026-10-24 |
| `use-mobile.ts` | cả hook | `useState` + `useEffect` → `useSyncExternalStore` | Bản upstream gọi `setState` thẳng trong thân effect, nên `react-hooks/set-state-in-effect` báo **error**. Trong repo này nó được hạ xuống `warn` cho riêng `base/**` — nhưng `eslint.config.mjs` **không đi theo registry**, nên `pnpm lint` của một project mới đỏ ngay ngày đầu, trên một file họ không viết. Cái giá không nằm ở ta; nó rơi xuống người dùng. Tiện thể bỏ luôn một nhịp render thừa: bản cũ luôn vẽ một lần với `undefined`. | 2026-10-05 |

Đây là patch vendor ĐẦU TIÊN, và nó đến từ pha 6. Tiêu chuẩn mà nó đặt ra cho các patch sau: không
phải "bản upstream chưa đẹp", mà **"cái giá của bản upstream rơi xuống người dùng chứ không rơi
xuống ta"**. Mọi thứ ta tự nuốt được trong monorepo thì vẫn để nguyên.

## Đã cân nhắc và CỐ Ý không patch

| chỗ | vì sao để nguyên |
|---|---|
| `button.tsx`, `calendar.tsx` — `text-[0.8rem]` | 0.8rem nằm giữa `footnote` (0.8125) và `caption1` (0.75) của thang. Patch được, nhưng sẽ phải áp lại mỗi lần cập nhật vendor, cho một khác biệt 0.2px. Không đáng. |
| `checkbox.tsx` — `rounded-[4px]`, `chart.tsx` — `rounded-[2px]` | Thang bán kính của ta nhỏ nhất là `sm` = 6px. 4px cho checkbox và 2px cho ô màu biểu đồ là nhu cầu thật mà thang chưa có. **Việc cần làm là thêm bậc `xs`/`2xs` vào thang**, không phải patch vendor. |
| `dialog/alert-dialog/drawer/sheet` — `backdrop-blur-xs` trên overlay | Đây đúng là trường hợp luật `glass-only-on-chrome` CHO PHÉP: scrim của modal là chrome đè lên nội dung, không phải nền sau chữ thân bài. |
| `navigation-menu.tsx` — `focus:outline-none` trên link | Base UI đặt vòng focus ở phần tử khác. Sửa ở đây sẽ phá cơ chế focus của chính primitive. |
| `sidebar.tsx:14`, `carousel.tsx:98` — `react-hooks/set-state-in-effect` | Quan ngại THẬT về render lồng, nhưng là mẫu upstream của shadcn. Đã hạ xuống `warn` cho riêng `base/**` trong `eslint.config.mjs` — vẫn thấy trong output, không chặn `verify`. Nếu upstream sửa thì warn tự mất. |

## Quyết định đã đảo ngược — pha 6: luật container query viết sai cú pháp

`max-@md/tabs:hidden` và `max-@md/page:ml-auto` **không sinh ra CSS nào**. Cú pháp max-width của
container query trong Tailwind v4 là `@max-md/{tên}:`, không phải `max-@md/{tên}:`. Đã đo bằng cách
grep CSS build ra của một project tiêu thụ:

```
@container page (min-width:28rem)        <- @md/page:  có
@container page not (min-width:28rem)    <- @max-md/page:  có
(không có gì)                            <- max-@md/page:  KHÔNG
```

Hai chỗ dính: `tab-select.tsx` (4 lần) và `PAGE_HEADER_ASIDE` trong `page-chrome.ts` — tức là hằng
số của **mọi trang**. Phần ghim phải của header trên màn hẹp chưa bao giờ hoạt động.

Bài học không phải "gõ nhầm". Là: **một class Tailwind sai tên thì im lặng tuyệt đối** — không lỗi
build, không cảnh báo, không gạch đỏ trong editor. Cùng một hình dạng với `--p-warm-light-1` ở pha 1
và với `--ease-overshoot: 0.2,1.4,0.4,1` sinh ra ở chính pha này. Ba lần, ba tầng khác nhau, cùng
một cơ chế: **thứ sai thì biến mất thay vì kêu lên.** Chỗ duy nhất bắt được chúng là nhìn vào ĐẦU RA,
không phải nhìn vào mã nguồn.
