import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from 'cn';
import { Skeleton } from '@/registry/base/skeleton';
import { InfoTooltip } from '@/registry/patterns/info-tooltip';

/**
 * Một ô số liệu (KPI): icon + nhãn một-hai chữ ở trên, con số ở dưới, lời giải thích nằm sau nút (i).
 *
 * Nó tồn tại vì lưới số liệu là chỗ một app lệch cỡ nhanh nhất: mỗi ô do một chỗ gọi tự dựng thì mỗi
 * ô một cỡ icon, một cỡ số, và thường thêm một câu chú thích dưới con số. Ở đây cỡ icon, cỡ số và chỗ
 * đặt lời giải thích do component quyết định, chỗ gọi chỉ đưa DỮ LIỆU vào.
 *
 * Lời giải thích (con số đến từ đâu, đếm cái gì) đi qua `explain` -> `InfoTooltip`, không bao giờ là
 * một dòng chữ dưới số: luật `every-control-explains-itself` đòi nó có mặt, còn người dùng thì đòi
 * trang ít chữ. Nút (i) thoả cả hai.
 *
 * Sáu trạng thái dữ liệu: nhãn dài -> truncate; số rất lớn -> chỗ gọi rút gọn (`1,2k`) vì chỉ nó biết
 * đơn vị; số 0 -> hiện `0`, không ẩn ô; đang tải -> `StatSkeleton` giữ đúng chiều cao.
 */
export function Stat({
  icon: Icon,
  label,
  value,
  explain,
  className,
}: {
  /** Icon từ `lucide-react`. Cỡ do component quyết định — luật `icon-size-scale`. */
  icon?: LucideIcon;
  /** Một-hai chữ. Câu dài hơn thì thuộc về `explain`. */
  label: string;
  value: ReactNode;
  /** Con số này đếm cái gì, lấy từ đâu. */
  explain?: ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="stat" className={cn('flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-3', className)}>
      <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
        <span className="min-w-0 truncate text-footnote">{label}</span>
        {explain ? <InfoTooltip text={explain} label={`Giải thích: ${label}`} className="ml-auto" /> : null}
      </div>
      <div className="min-w-0 truncate text-title2 font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/** Khung chờ của `Stat` — cùng padding, cùng hai hàng, để lưới số liệu không nhảy khi dữ liệu về. */
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="stat"
      aria-hidden
      className={cn('flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-3', className)}
    >
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-7 w-14" />
    </div>
  );
}
