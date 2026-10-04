/**
 * Phần khung mà `PageShell` và `PageSkeleton` DÙNG CHUNG.
 *
 * Ở sakubun hai component này là hai file độc lập chép class của nhau, cộng một bài e2e giữ chúng
 * bằng nhau. Bài e2e đó ra đời vì chúng ĐÃ lệch: placeholder của thanh trên di động bị thiếu hẳn,
 * nên dưới `md` breadcrumb bắt đầu ở mép trái rồi nhảy ~41px sang phải đúng lúc nội dung thật tới —
 * mỗi lần điều hướng, trên mọi trang.
 *
 * Ở đây phần chung được TÁCH RA thay vì được kiểm. Một bài test bắt được lệch sau khi nó xảy ra; một
 * hằng số dùng chung thì làm lệch không xảy ra được. Luật `skeleton-mirrors-its-page` vẫn còn vì nó
 * nói về cả phần THÂN trang — chỗ mỗi route tự dựng skeleton của mình.
 */

export type PageWidth = 'full' | 'wide' | 'narrow' | 'form';

/** `full` thừa hưởng bề rộng của shell (trang dày dữ liệu). Các bậc hẹp hơn căn giữa nội dung đọc. */
export const PAGE_WIDTH: Record<PageWidth, string> = {
  full: '',
  wide: 'mx-auto max-w-5xl',
  narrow: 'mx-auto max-w-3xl',
  form: 'mx-auto max-w-2xl',
};

/** Hàng ngoài cùng của trang: padding dọc và nhịp dọc. */
export const PAGE_ROOT = 'flex flex-col gap-6 pt-6 pb-6';

/**
 * HÀNG HEADER — hàng duy nhất tồn tại trên MỌI trang, nên mọi khác biệt ở đây hiện ra thành một cú
 * nhảy ở MỌI lần điều hướng. Đây là chuỗi class mà cả trang thật lẫn skeleton đều dùng.
 */
export const PAGE_HEADER_ROW = 'flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2';

/** Phần aside của header: ghim phải chỉ khi hẹp; từ `@md` trở lên nó nằm trong luồng. */
export const PAGE_HEADER_ASIDE = 'max-@md/page:ml-auto';
