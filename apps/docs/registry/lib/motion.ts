'use client';

import * as React from 'react';
import { animate, MotionConfigContext, useReducedMotion as useSystemReducedMotion } from 'motion/react';
import type { TargetAndTransition, Transition } from 'motion/react';
import { primitive } from '@/registry/lib/motion-tokens';

/**
 * Tầng CẢM GIÁC: spring, độ sâu, và chính sách giảm chuyển động.
 *
 * VAY từ `@seamui/motion` qua quy trình khu cách ly năm bước (xem `docs/vay-component.md`). Vay vì
 * nó mang ba thứ khó tự nghĩ ra, không phải vì nó tiết kiệm thời gian gõ:
 *
 *  1. Base UI GIỮ popup mounted suốt lúc thoát và chờ CSS transition trước khi unmount — nó không
 *     chờ được spring chạy trên rAF của motion. Nên lớp phủ phải animate bằng CSS keyed vào
 *     `data-starting-style` / `data-ending-style`, không bằng motion. Không biết điều này thì mọi
 *     hiệu ứng thoát sẽ bị cắt phựt, và triệu chứng không chỉ về chỗ sai.
 *  2. Composite của Base UI (Toolbar, ToggleGroup, Tabs, Menubar) đăng ký item qua REF của phần tử.
 *     Đặt một motion component vào đường render đó làm hỏng đăng ký — kể cả `render={<motion.button/>}`
 *     cũng làm phím mũi tên chết. Nên press depth ở đó phải chạy bằng `animate()` mệnh lệnh trên
 *     phần tử thuần.
 *  3. Chính sách giảm chuyển động "KHÔNG BAO GIỜ chết": đổi chuyển động (scale/translate) thành
 *     opacity, để mọi tương tác vẫn có phản hồi — chỉ là không di chuyển. Luật toàn cục trong
 *     `@thienui/tokens/base.css` thì tắt hẳn animation; chính sách này tốt hơn.
 *
 * ĐÃ BỎ khi thăng cấp: `useMounted` của bản gốc dùng mẫu `useState` + `useEffect(() => setMounted(true))`,
 * thứ gọi setState đồng bộ trong effect. Repo này đã có `lib/use-mounted.ts` dựng trên
 * `useSyncExternalStore` — không state, không effect, không render lồng. Vay không có nghĩa là nhận
 * cả những chỗ mình đã làm tốt hơn.
 *
 * ĐÃ TÁI-TOKEN-HOÁ, và đó là khác biệt với bản gốc: mọi thời lượng và easing đọc từ token của thienui
 * (`var(--p-motion-*)`), không giữ số của seam. Cổng `no-raw-durations` bắt được đúng ba dòng có
 * thời lượng và đường cong bezier viết cứng, khi file này còn trong khu cách ly — ánh xạ vào thang
 * của mình mới là tái-token-hoá; chép số người khác vào chỉ là đổi chỗ cất literal.
 *
 * Ánh xạ thời lượng đã làm: lớp phủ vào 200ms -> `base` · ra 150ms -> `fast` · sheet 300ms -> `slow`
 * · toast 500ms -> `slow`. Bốn trong bốn đều có sẵn chỗ trong thang, nên không thêm token nào — và
 * nó khớp sẵn triết lý "vào chậm hơn, ra nhanh hơn" vốn đã ghi trong `scale.json`.
 */

/* ───────────────────────── tính cách ───────────────────────── */

export type SpringRole = 'press' | 'snappy' | 'surface' | 'bouncy';
export type Personality = 'seam' | 'brisk' | 'relaxed' | 'playful';

/** Đổi MỘT dòng này là cả hệ đổi cảm giác cùng nhau; không phải sửa file component nào. */
export const PERSONALITY: Personality = 'seam';

/**
 * Khoá token được DẪN XUẤT từ chính `primitive`, không khai bằng tay.
 *
 * `primitive` là `as const`, nên index bằng một template-literal type sẽ không compile. Dẫn xuất
 * union từ nó thì ngược lại: đổi tên một token trong `scale.json` là TypeScript đỏ ngay tại đây, thay
 * vì trả `undefined` lúc runtime và animation im lặng chạy sai nhịp.
 */
type SpringKey = Extract<keyof typeof primitive, `motion.spring.${string}`>;
type DurationKey = Extract<keyof typeof primitive, `motion.duration.${string}`>;

const spring = (role: SpringRole): Transition => ({
  type: 'spring',
  ...(primitive[`motion.spring.${PERSONALITY}.${role}` as SpringKey] as unknown as {
    stiffness: number;
    damping: number;
    mass: number;
  }),
});

export const springs: Record<SpringRole, Transition> = {
  press: spring('press'),
  snappy: spring('snappy'),
  surface: spring('surface'),
  bouncy: spring('bouncy'),
};

/** Số giây, cho motion/react — token là chuỗi CSS ("200ms"), motion muốn số. */
const seconds = (key: DurationKey) => Number(String(primitive[key]).replace('ms', '')) / 1000;

/** Fade chỉ-opacity — chỗ DUY NHẤT thời lượng phẳng được phép, vì không có gì để spring. */
export const fades = {
  fast: { duration: seconds('motion.duration.fast'), ease: 'easeOut' },
  normal: { duration: seconds('motion.duration.base'), ease: 'easeOut' },
} as const satisfies Record<string, Transition>;

/* ───────────────────────── độ sâu ───────────────────────── */

/**
 * Trục z ảo, diễn tả bằng cặp scale + dịch chuyển.
 *
 * `overlay`/`modal` chỉ dành cho phần tử mà **motion.dev điều khiển trọn vẹn** — mục danh sách, chip,
 * nút cuộn-xuống-cuối (AnimatePresence sở hữu mount/unmount nên `exit` chạy). Popup của Base UI thì
 * KHÔNG dùng chúng: Base UI sở hữu vòng đời và chờ CSS, nên chúng dùng `condense` bên dưới.
 */
export const depth = {
  pressed: { scale: 0.97 },
  resting: { scale: 1 },
  raised: { scale: 1.02 },
  overlay: {
    initial: { opacity: 0, scale: 0.96, y: 4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 2 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: 6 },
  },
} as const;

/* ───────────────────────── condense (CSS, cho Base UI) ───────────────────────── */

const D_FAST = 'duration-[var(--p-motion-duration-fast)]';
const D_BASE = 'duration-[var(--p-motion-duration-base)]';
const D_SLOW = 'duration-[var(--p-motion-duration-slow)]';

/**
 * Cách MỌI lớp phủ Base UI animate: nổi lên + hiện dần, lùi lại + mờ đi, backdrop cùng một nhịp.
 *
 * Viết bằng CSS (keyed vào `data-starting-style` / `data-ending-style`) vì Base UI giữ popup mounted
 * suốt lúc thoát và chờ CSS transition trước khi unmount — nó không chờ được spring trên rAF. Đây là
 * chỗ DUY NHẤT trong hệ mà chuyển động được diễn tả bằng class, và lý do là vòng đời của Base UI vốn
 * CSS-native.
 *
 * Scale chạy trên thuộc tính `scale` độc lập, không trên `transform`: Base UI sở hữu `transform` để
 * định vị, nên một scale dựa trên transform sẽ bị nó ghi đè.
 *
 * Mọi thời lượng/easing đọc từ token. `ease-overshoot` chính là đường cong "nảy" mà seam dùng —
 * (0.22,1.3,0.36,1) của họ cách (0.2,1.4,0.4,1) của ta 0.11 trong không gian control point, tức là
 * cùng một ý đồ, nên map vào thay vì thêm một token trùng nghĩa.
 */
export const condense = {
  /** Popup: nổi lên + hiện dần từ phía trigger, lùi lại nhanh hơn khi thoát. */
  surface: [
    'origin-[var(--transform-origin)] transition-[opacity,scale]',
    D_BASE,
    'ease-overshoot',
    'data-[starting-style]:opacity-0 data-[starting-style]:[scale:0.95]',
    'data-[ending-style]:opacity-0 data-[ending-style]:[scale:0.96]',
    `data-[ending-style]:${D_FAST} data-[ending-style]:ease-out`,
    'motion-reduce:transition-opacity motion-reduce:data-[starting-style]:[scale:1] motion-reduce:data-[ending-style]:[scale:1]',
  ].join(' '),

  /** Backdrop / scrim: cùng nhịp với panel, không transform. */
  backdrop: [
    'transition-opacity',
    D_BASE,
    'ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
    `data-[ending-style]:${D_FAST}`,
  ].join(' '),

  /** Bottom sheet: trượt lên từ ngoài màn. Slide chạy trên `translate` vì Base UI sở hữu
   *  `transform` cho cử chỉ vuốt; tự tắt transition giữa lúc kéo để cử chỉ giữ tỉ lệ 1:1. */
  sheet: [
    'transition-[translate,opacity]',
    D_SLOW,
    'ease-decelerate',
    'data-[starting-style]:translate-y-full data-[starting-style]:opacity-0',
    'data-[ending-style]:translate-y-full data-[ending-style]:opacity-0',
    'data-[dragging]:transition-none',
    'motion-reduce:transition-opacity motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[ending-style]:translate-y-0',
  ].join(' '),

  /** Toast: nổi lên + hiện dần, rơi lại nhanh hơn khi đóng. Vuốt để đóng tự huỷ cú rơi dọc, nên
   *  hướng của cử chỉ thắng. */
  toast: [
    'transition-[transform,opacity]',
    D_SLOW,
    'ease-overshoot',
    'data-[starting-style]:translate-y-6 data-[starting-style]:opacity-0',
    'data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0',
    'data-[ending-style]:[&[data-swipe-direction]]:translate-y-0',
    'motion-reduce:transition-opacity motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[ending-style]:translate-y-0',
  ].join(' '),
} as const;

/* ───────────────────────── giảm chuyển động ───────────────────────── */

export type MotionPreference = 'system' | 'reduce' | 'full';
const MotionPreferenceContext = React.createContext<MotionPreference>('system');

/**
 * Ép biến thể giảm (hoặc đầy đủ) cho một nhánh cây, ghi đè OS.
 *
 * Mặc định mọi thứ theo `prefers-reduced-motion`, và đó là điều một app NÊN làm. Provider này tồn
 * tại để một màn hình cài đặt có thể cho người dùng chọn chuyển động như một tuỳ chọn thật.
 */
export function MotionPreferenceProvider({
  preference,
  children,
}: {
  preference: MotionPreference;
  children: React.ReactNode;
}) {
  return React.createElement(MotionPreferenceContext.Provider, { value: preference }, children);
}

/**
 * Tín hiệu giảm-chuyển-động mà mọi component nhánh theo. Import từ ĐÂY, không import
 * `useReducedMotion` thẳng từ `motion/react` — đi qua đây mới cho phép app ghi đè OS.
 *
 * Thứ tự giải:
 *   1. `<MotionPreferenceProvider>` bao quanh — lựa chọn tường minh của app
 *   2. `<MotionConfig reducedMotion="always">` — opt-in rõ ràng
 *   3. media query `prefers-reduced-motion` của OS
 *
 * CỐ Ý KHÔNG tôn trọng `reducedMotion: "never"` của MotionConfig: đó là giá trị MẶC ĐỊNH trong
 * context của motion, nên nó có mặt cả khi không ai dựng provider, và không phân biệt được với một
 * lần opt-out thật. Coi nó là "ép chuyển động đầy đủ" chính là cách hook này từng âm thầm bỏ qua
 * cài đặt OS cho mọi consumer. Ghi chú này đến từ bản gốc của @seamui, và nó là lý do chính đáng để
 * vay thay vì tự viết.
 */
export function useReducedMotion(): boolean {
  const preference = React.useContext(MotionPreferenceContext);
  const { reducedMotion } = React.useContext(MotionConfigContext);
  const system = useSystemReducedMotion();

  if (preference === 'reduce' || reducedMotion === 'always') return true;
  if (preference === 'full') return false;
  return system ?? false;
}

/**
 * Dự phòng khi giảm chuyển động. Chính sách: KHÔNG BAO GIỜ chết.
 *
 * Đổi chuyển động (scale/translate) thành opacity, để mọi tương tác vẫn có phản hồi — nó chỉ không
 * di chuyển. Một control không phản hồi gì khi bấm là một control hỏng, kể cả với người đã khai muốn
 * ít chuyển động.
 */
export const reduced = {
  /** Phản hồi nhấn không cần di chuyển: mờ đi một chút. */
  pressed: { opacity: 0.7 },
  /** Mọi lối vào thu về fade chỉ-opacity. */
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
} as const;

/* ───────────────────────── press depth ───────────────────────── */

type PressableProps = {
  onPointerDown?: React.PointerEventHandler<HTMLElement>;
  onPointerUp?: React.PointerEventHandler<HTMLElement>;
  onPointerCancel?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLElement>;
};

/**
 * Press depth MỆNH LỆNH, cho control mà phần tử render ra phải là một DOM node thuần.
 *
 * Composite của Base UI (Toolbar, ToggleGroup, Tabs, Menubar) đăng ký item và rove focus qua REF của
 * phần tử. Một motion component nằm trong đường render đó phá vỡ đăng ký — kể cả
 * `render={<motion.button/>}` cũng để lại phím mũi tên chết. Nên item trong composite nhấn bằng
 * `animate()` mệnh lệnh trên phần tử thuần: cùng token, cùng cảm giác.
 *
 *   const withPress = usePressDepth(disabled);
 *   render={(props) => <button {...withPress(props)} />}
 *
 * Phản hồi phải bắn cả khi kích hoạt bằng BÀN PHÍM — nếu không, Space/Enter là đường duy nhất không
 * có xác nhận nào rằng cú bấm đã được nhận.
 */
export function usePressDepth(disabled = false) {
  const reduceMotion = useReducedMotion();

  return React.useCallback(
    <P extends PressableProps>(props: P): P => {
      const press = (el: HTMLElement) => {
        if (disabled) return;
        if (reduceMotion) animate(el, reduced.pressed, fades.fast);
        else animate(el, depth.pressed, springs.press);
      };
      const settle = (el: HTMLElement) => {
        if (disabled) return;
        if (reduceMotion) animate(el, { opacity: 1 }, fades.fast);
        else animate(el, depth.resting, springs.snappy);
      };
      return {
        ...props,
        onPointerDown: (e) => {
          props.onPointerDown?.(e);
          if (e.button === 0) press(e.currentTarget);
        },
        onPointerUp: (e) => {
          props.onPointerUp?.(e);
          settle(e.currentTarget);
        },
        onPointerCancel: (e) => {
          props.onPointerCancel?.(e);
          settle(e.currentTarget);
        },
        onPointerLeave: (e) => {
          props.onPointerLeave?.(e);
          settle(e.currentTarget);
        },
        onKeyDown: (e) => {
          props.onKeyDown?.(e);
          if (!e.repeat && (e.key === ' ' || e.key === 'Enter')) press(e.currentTarget);
        },
        onKeyUp: (e) => {
          props.onKeyUp?.(e);
          if (e.key === ' ' || e.key === 'Enter') settle(e.currentTarget);
        },
      };
    },
    [disabled, reduceMotion]
  );
}

/**
 * Rung ngang ngắn, báo lỗi. Là một chuỗi keyframe mà spring không diễn tả được, nên nó mang thời
 * lượng riêng (như `fades`). Đây là CHUYỂN ĐỘNG, nên nó không bao giờ chạy dưới giảm-chuyển-động —
 * ghép với một tín hiệu không di chuyển ở chỗ gọi.
 */
export const shake: { animate: TargetAndTransition; transition: Transition } = {
  animate: { x: [0, -6, 6, -4, 4, 0] },
  transition: { duration: seconds('motion.duration.slow'), ease: 'easeInOut' },
};
