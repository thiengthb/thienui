import { cn } from 'cn';

/**
 * Khung một mục trên trang token.
 *
 * `@container` ở đây là có chủ ý và nó là luật của repo (`container-query-not-viewport`): các grid
 * bên trong dùng `@2xl:` / `@3xl:`, tức là chúng phản ứng theo BỀ RỘNG CỦA MỤC, không theo viewport.
 * Nhờ vậy cùng một mục đặt trong sidebar hẹp hay trong cột rộng đều trông đúng.
 */
export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="@container flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 border-b pb-3">
        <h2 className="text-title3 font-semibold tracking-snug">{title}</h2>
        {note ? <p className="max-w-prose text-footnote text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Một ô màu tầng 1. Giá trị đến từ dữ liệu token, nên nó không phải màu cứng. */
export function Swatch({ label, value, token }: { label: string; value: string; token: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        style={{ background: value }}
        className="size-9 rounded-md border"
        // Không dùng `title=` — luật explain-is-the-only-tooltip. Tên token hiện ngay dưới ô.
        aria-label={`${token}: ${value}`}
      />
      <code className="text-caption2 tabular-nums text-muted-foreground">{label}</code>
    </div>
  );
}

/** Một dòng token tầng 2: ô màu + tên + giá trị đã resolve (của theme mặc định, để tham chiếu). */
export function Row({ token, resolved }: { token: string; resolved?: string }) {
  const isColor = !token.startsWith('shadow-');
  return (
    <div className="flex items-center gap-3 py-2">
      {isColor ? (
        <div
          style={{ background: `var(--${token})` }}
          className="size-6 shrink-0 rounded-sm border"
          aria-hidden
        />
      ) : null}
      <code className={cn('min-w-0 flex-1 truncate text-footnote', !isColor && 'pl-9')}>--{token}</code>
      <code className="shrink-0 text-caption2 tabular-nums text-muted-foreground max-sm:hidden">
        {resolved ?? ''}
      </code>
    </div>
  );
}
