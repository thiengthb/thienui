/**
 * Toán thuần cho phân trang VỪA MÀN HÌNH — bao nhiêu mục nằm được dưới một mép trên cho trước mà
 * không đẩy trang vượt quá viewport (thứ sinh ra thanh cuộn và đẩy thanh phân trang xuống dưới màn).
 *
 * Giữ KHÔNG DOM và tách riêng để test được. Phần đo DOM thật nằm ở `use-fit-rows.ts`.
 */
export interface FitInput {
  /** Chiều cao viewport dùng được (window.innerHeight). */
  viewportHeight: number;
  /** Khoảng cách từ đỉnh viewport tới chỗ hàng đầu tiên bắt đầu. */
  rowsTop: number;
  /** Phần chrome phải chừa dưới hàng cuối: người gọi đo `footer.bottom − rows.bottom`, nên nó gồm cả
   *  khoảng hở phía trên footer, thanh cuộn ngang của bảng, và chính footer. */
  footerHeight: number;
  /** Bước của MỘT hàng (px). Với bảng là chiều cao hàng trung bình; với grid là chiều cao hàng card
   *  đã cộng row-gap. */
  rowHeight: number;
  /** Số card mỗi hàng với grid (1 với bảng). */
  itemsPerRow?: number;
  /** Phần chừa CÒN LẠI chưa nằm trong `footerHeight` — thường chỉ là padding dưới của trang. Giữ nhỏ;
   *  thiên về vừa THIẾU một hàng (vô hại) tốt hơn thừa một hàng (gây cuộn). */
  bottomGap?: number;
  min?: number;
  max?: number;
}

/**
 *   available = viewport − rowsTop − footer − bottomGap
 *   rows      = floor(available / rowHeight)   (ít nhất 1)
 *   items     = rows × itemsPerRow, kẹp vào [min, max]
 *
 * Điểm mấu chốt là chừa chiều cao footer ĐO ĐƯỢC, không phải đoán — để thanh phân trang không bao
 * giờ rơi xuống dưới màn hình.
 */
export function fitItemCount({
  viewportHeight,
  rowsTop,
  footerHeight,
  rowHeight,
  itemsPerRow = 1,
  bottomGap = 48,
  min = 5,
  max = 100,
}: FitInput): number {
  const perRow = Math.max(1, Math.floor(itemsPerRow));
  const pitch = Math.max(1, rowHeight);
  const available = viewportHeight - rowsTop - footerHeight - bottomGap;
  const rows = Math.max(1, Math.floor(available / pitch));
  const items = rows * perRow;
  const lo = Math.max(1, min);
  return Math.min(max, Math.max(lo, items));
}
