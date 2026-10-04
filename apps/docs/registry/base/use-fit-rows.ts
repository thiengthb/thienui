'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { fitItemCount } from '@/registry/base/fit-rows';

/**
 * Bao nhiêu mục vừa màn hình để danh sách + thanh phân trang nằm TRỌN trong viewport.
 *
 * Luật `pagination-auto-fit`. Lý do nó tồn tại: một thanh phân trang bị đẩy xuống dưới màn hình là
 * một tính năng người dùng không tìm thấy. Và chọn số hàng cố định thì sai ở mọi màn hình trừ màn
 * hình của người viết code.
 *
 * Khác với kiểu "chừa đại N px", hook này ĐO cả layout từ DOM: mép trên của vùng hàng, chiều cao
 * thật của một hàng (không ước lượng), số cột sống của grid, và chiều cao THẬT của footer — nên một
 * footer gãy thành hai dòng trên màn hẹp chỉ làm vừa ít hàng hơn chứ không tràn.
 *
 * CHỐNG RUNG (phần quan trọng nhất, và là phần người ta hay bỏ): chỉ nhận số mới khi một đầu vào
 * "cứng" đổi — chiều cao viewport, mép trên của vùng hàng, hoặc số cột. Dao động ±1 hàng ở cùng một
 * chiều cao viewport bị coi là nhiễu. Không có nó thì số hàng dao động N ↔ N−1 vô tận ngay tại biên
 * vừa khít: render N hàng làm trang có thanh cuộn → bề rộng hẹp lại → một card/footer gãy dòng →
 * bước hàng tăng → tính lại ra N−1 → hết thanh cuộn → về N → … Người dùng thấy đúng một thứ: giật.
 *
 * Trả `null` cho tới lần đo đầu tiên — chỗ gọi dùng một số cố định trong lúc đó.
 */
export interface UseFitRowsOptions {
  topRef: RefObject<HTMLElement | null>;
  footerRef?: RefObject<HTMLElement | null>;
  /** Bước hàng dự phòng, chỉ dùng tới khi chưa đo được hàng thật từ DOM. */
  rowHeight: number;
  rowGap?: number;
  /** Đọc số cột sống từ `grid-template-columns` của hộp chứa (grid card responsive). */
  grid?: boolean;
  bottomGap?: number;
  min?: number;
  max?: number;
  footerFallback?: number;
}

type Committed = { count: number; innerHeight: number; top: number; perRow: number };

export function useFitRows({
  topRef,
  footerRef,
  rowHeight,
  rowGap = 0,
  grid = false,
  bottomGap = 28,
  min,
  max,
  footerFallback = 56,
}: UseFitRowsOptions): number | null {
  const [count, setCount] = useState<number | null>(null);
  const committed = useRef<Committed | null>(null);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const top = topRef.current;
      if (!top) return;
      const rect = top.getBoundingClientRect();

      // Số cột sống: đọc từ `grid-template-columns` đã resolve, không đoán theo breakpoint — grid có
      // thể đổi cột vì CONTAINER hẹp chứ không vì viewport hẹp.
      let perRow = 1;
      if (grid) {
        const cols = getComputedStyle(top).gridTemplateColumns;
        perRow = Math.max(1, cols.split(' ').filter(Boolean).length);
      }

      // Bước hàng THẬT: tổng chiều cao ÷ số hàng đang render, chứ không lấy chiều cao của hàng đầu —
      // hàng đầu hay cao hơn (border trên) hoặc thấp hơn (không có border) các hàng còn lại.
      const rendered = top.children.length;
      const pitch =
        rendered > 0 && rect.height > 0
          ? rect.height / Math.max(1, Math.ceil(rendered / perRow)) + rowGap
          : rowHeight + rowGap;

      // Chrome dưới: đo từ đáy vùng hàng tới đáy footer, nên nó bao luôn khoảng hở và thanh cuộn
      // ngang — ba thứ mà đếm riêng từng cái sẽ sai ở ít nhất một màn hình.
      const footer = footerRef?.current;
      const footerHeight = footer
        ? Math.max(0, footer.getBoundingClientRect().bottom - rect.bottom)
        : footerFallback;

      const next = fitItemCount({
        viewportHeight: window.innerHeight,
        rowsTop: rect.top,
        footerHeight,
        rowHeight: pitch,
        itemsPerRow: perRow,
        bottomGap,
        ...(min === undefined ? {} : { min }),
        ...(max === undefined ? {} : { max }),
      });

      const prev = committed.current;
      const hardChange =
        !prev ||
        prev.innerHeight !== window.innerHeight ||
        Math.abs(prev.top - rect.top) > 2 ||
        prev.perRow !== perRow;

      // Vùng chết: lệch đúng một hàng mà không có đầu vào cứng nào đổi thì bỏ qua.
      if (!hardChange && Math.abs(next - prev.count) <= perRow) return;

      committed.current = { count: next, innerHeight: window.innerHeight, top: rect.top, perRow };
      setCount(next);
    };

    // Gộp vào một rAF: resize và ResizeObserver bắn dồn dập, đo mỗi lần là đo trên layout dở dang.
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    if (topRef.current) ro.observe(topRef.current);
    if (footerRef?.current) ro.observe(footerRef.current);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [topRef, footerRef, rowHeight, rowGap, grid, bottomGap, min, max, footerFallback]);

  return count;
}
