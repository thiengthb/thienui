'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/registry/base/button';

/**
 * CHỒNG THẺ lướt được: một thẻ mỗi lần, bấm/Space để lật, vuốt ngang để đi tiếp.
 *
 * Luật `cards-move-by-swipe`. Ẩn dụ vật lý: nếu nó trông như một chồng thẻ thì nó phải hành xử như
 * một chồng thẻ — và phần người ta hay bỏ không phải cú vuốt mà là PHẢN HỒI THEO NGÓN TAY. Chờ một
 * ngưỡng rồi mới nhảy làm cử chỉ cảm giác như bị trễ, dù tổng thời gian bằng nhau; đi theo ngón ngay
 * thì nó cảm giác như đang cầm một vật.
 *
 * Ba đường điều khiển, và cả ba bắt buộc có:
 *  - VUỐT ngang (pointer) — tự nhiên nhất trên cảm ứng
 *  - HAI NÚT mũi tên — đường duy nhất cho chuột, và là đường duy nhất nhìn thấy được
 *  - BÀN PHÍM ←/→ và Space — thiếu nó thì cả thành phần vô hình với người không dùng chuột
 *
 * Dùng Pointer Events, không dùng touch + mouse riêng: một bộ handler phục vụ cả cảm ứng, chuột và
 * bút. `setPointerCapture` để ngón tay rời khỏi thẻ giữa chừng vẫn còn được theo dõi — không có nó,
 * vuốt nhanh sẽ "rơi" ở giữa đường và thẻ kẹt ở vị trí dở dang.
 *
 * Mọi chuyển động chạy bằng CSS transition trên `transform`, nên luật `prefers-reduced-motion` toàn
 * cục trong `@thienui/tokens/base.css` tự vô hiệu hoá nó. Viết bằng JS thì luật đó không chạm tới.
 */
export function CardDeck({
  count,
  index,
  onIndexChange,
  renderCard,
  onFlip,
  flipped = false,
  threshold = 0.25,
  className,
  label = 'Chồng thẻ',
}: {
  count: number;
  index: number;
  onIndexChange: (next: number) => void;
  renderCard: (index: number) => React.ReactNode;
  /** Bấm/Space lật thẻ. Bỏ qua nếu thẻ không có mặt sau. */
  onFlip?: () => void;
  flipped?: boolean;
  /** Tỉ lệ bề rộng phải vuốt qua mới tính là đổi thẻ. 0.25 = một phần tư. */
  threshold?: number;
  className?: string;
  label?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const start = React.useRef<number | null>(null);
  const [dx, setDx] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const go = React.useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0 || next >= count) return;
      onIndexChange(next);
    },
    [index, count, onIndexChange]
  );

  function onPointerDown(e: React.PointerEvent) {
    // Bỏ qua nút chuột phải/giữa: chúng không phải cử chỉ vuốt.
    if (e.button !== 0) return;
    start.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (start.current === null) return;
    // Đi theo ngón NGAY, không chờ ngưỡng — đây là cả điểm của luật.
    setDx(e.clientX - start.current);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (start.current === null) return;
    const width = ref.current?.offsetWidth ?? 1;
    const moved = e.clientX - start.current;
    start.current = null;
    setDragging(false);
    setDx(0);
    if (Math.abs(moved) > width * threshold) go(moved < 0 ? 1 : -1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if ((e.key === ' ' || e.key === 'Enter') && onFlip) {
      e.preventDefault();
      onFlip();
    }
  }

  if (count === 0) return null;

  return (
    <div className={cn('@container/deck flex flex-col items-center gap-4', className)}>
      <div
        ref={ref}
        // `tabIndex` + `role` + `aria-roledescription`: không có chúng thì cả chồng thẻ không tồn
        // tại với bàn phím và trình đọc màn hình — mà nội dung học thì nằm hết ở đây.
        tabIndex={0}
        role="group"
        aria-roledescription="chồng thẻ"
        aria-label={`${label}: thẻ ${index + 1} trên ${count}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onClick={() => onFlip?.()}
        style={{
          transform: `translateX(${dx}px) rotate(${dx / 60}deg)`,
          transitionDuration: dragging ? '0ms' : 'var(--p-motion-duration-base)',
          transitionTimingFunction: 'var(--p-motion-easing-standard)',
        }}
        className={cn(
          'relative w-full max-w-md touch-pan-y rounded-xl border bg-card p-6 shadow-2 transition-transform select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          onFlip && 'cursor-pointer'
        )}
      >
        {renderCard(index)}
        {onFlip ? (
          <span className="pointer-events-none absolute right-3 bottom-2 text-caption2 text-muted-foreground">
            {flipped ? 'mặt sau' : 'bấm hoặc Space để lật'}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Thẻ trước"
          className="target-44 rounded-full"
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-16 text-center text-footnote tabular-nums text-muted-foreground">
          {index + 1} / {count}
        </span>
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={() => go(1)}
          disabled={index === count - 1}
          aria-label="Thẻ sau"
          className="target-44 rounded-full"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
