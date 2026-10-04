'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/registry/base/button';

/**
 * Chỗ để CẢM thấy token chuyển động, không chỉ đọc con số.
 *
 * Mọi animation ở đây chạy bằng CSS transition trên `transform`, và đó là một quyết định: luật
 * `prefers-reduced-motion` toàn cục trong `@thienui/tokens/base.css` chỉ chạm tới được CSS. Nếu
 * dựng bằng JS thì người dùng khai muốn ít chuyển động sẽ vẫn nhận đủ chuyển động — và không ai
 * phát hiện ra, vì nó trông đúng với người không khai gì.
 *
 * Thời lượng và easing lấy từ `var(--p-motion-*)`, không viết số tại chỗ — luật `no-raw-durations`.
 */
export function MotionLab({
  durations,
  easings,
}: {
  durations: readonly (readonly [string, string])[];
  easings: readonly (readonly [string, string])[];
}) {
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => setRun((n) => n + 1)}>
          <Play data-icon="inline-start" />
          Chạy lại
        </Button>
        <span className="text-caption1 text-muted-foreground">
          Mỗi hàng là một token. Để ý hàng <code>deliberate</code> — trên 480ms người dùng bắt đầu <em>đợi</em>.
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-footnote font-semibold text-muted-foreground">Thời lượng · easing chuẩn</h3>
        {durations.map(([name, value]) => (
          <Track key={name} label={`duration-${name}`} value={value} run={run}>
            {(moved) => (
              <Dot
                moved={moved}
                className="bg-primary"
                duration={`var(--p-motion-duration-${name})`}
                easing="var(--p-motion-easing-standard)"
              />
            )}
          </Track>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-footnote font-semibold text-muted-foreground">
          Easing · cùng một thời lượng (base)
        </h3>
        {easings.map(([name, value]) => (
          <Track key={name} label={`ease-${name}`} value={value} run={run}>
            {(moved) => (
              <Dot
                moved={moved}
                className="bg-accent-brand"
                duration="var(--p-motion-duration-slow)"
                easing={`var(--p-motion-easing-${name})`}
              />
            )}
          </Track>
        ))}
      </div>
    </div>
  );
}

function Dot({
  moved,
  className,
  duration,
  easing,
}: {
  moved: boolean;
  className: string;
  duration: string;
  easing: string;
}) {
  return (
    <div
      style={{
        transitionDuration: duration,
        transitionTimingFunction: easing,
        left: moved ? 'calc(100% - var(--p-space-5))' : '0px',
      }}
      className={`absolute top-0 size-5 rounded-full transition-[left] ${className}`}
    />
  );
}

function Track({
  label,
  value,
  run,
  children,
}: {
  label: string;
  value: string;
  run: number;
  children: (moved: boolean) => React.ReactNode;
}) {
  const [moved, setMoved] = React.useState(false);

  React.useEffect(() => {
    // Về chỗ, rồi sang phải ở frame sau. Không có hai frame thì browser gộp hai lần đổi style thành
    // một và transition không chạy lần nào.
    //
    // Cả hai setState nằm TRONG rAF, kể cả lần reset. Gọi `setMoved(false)` đồng bộ ngay trong thân
    // effect thì nó là một render lồng ngay sau render vừa xong — và với 9 track trên trang thì đó
    // là 9 lần render thừa mỗi lần bấm "Chạy lại".
    let second = 0;
    const first = requestAnimationFrame(() => {
      setMoved(false);
      second = requestAnimationFrame(() => setMoved(true));
    });
    return () => {
      cancelAnimationFrame(first);
      if (second) cancelAnimationFrame(second);
    };
  }, [run]);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <code className="w-44 shrink-0 text-caption1 text-muted-foreground">{label}</code>
      <code className="w-40 shrink-0 text-caption2 tabular-nums text-muted-foreground max-sm:hidden">
        {value}
      </code>
      {/* `relative` + `left` tuyệt đối: `%` trong `translateX` tính theo CHÍNH phần tử, nên một
          điểm 20px sẽ chỉ nhích 20px chứ không chạy hết track. `left` thì tính theo phần tử cha. */}
      <div className="relative min-w-40 flex-1 rounded-full bg-muted p-1.5">
        <div className="relative h-5">{children(moved)}</div>
      </div>
    </div>
  );
}
