'use client';

import * as React from 'react';
import themeMeta from '@thienui/tokens/themes.json';

/**
 * Trục theme thứ hai.
 *
 * `next-themes` quản `class="dark"` trên <html> — đó là trục MODE. Nhưng hệ token có hai trục: mode
 * (sáng/tối) và BRAND (`data-theme="claude" | "slate"`), và `next-themes` chỉ quản được một attribute.
 * Nên trục brand có provider riêng ở đây.
 *
 * Ghi thẳng vào `documentElement` thay vì render một wrapper có `data-theme`: token brand được khai ở
 * `[data-theme='x']` và `[data-theme='x'].dark`, nên cả hai attribute phải nằm trên CÙNG MỘT phần tử.
 * Đặt `data-theme` trên một div bên trong thì selector `.dark` của next-themes ở <html> không với tới
 * được, và theme tối của brand phụ sẽ không bao giờ áp.
 */

export type BrandTheme = (typeof themeMeta)[number]['name'];

const STORAGE_KEY = 'thienui-brand';
const DEFAULT: BrandTheme = (themeMeta.find((t) => t.default)?.name ?? themeMeta[0]!.name) as BrandTheme;

const Ctx = React.createContext<{
  brand: BrandTheme;
  setBrand: (b: BrandTheme) => void;
  themes: typeof themeMeta;
}>({ brand: DEFAULT, setBrand: () => {}, themes: themeMeta });

/**
 * localStorage LÀ store, không phải nguồn để copy vào state.
 *
 * Mẫu `useState` + `useEffect(() => setState(saved))` gọi setState đồng bộ trong effect (luật
 * `react-hooks/set-state-in-effect` bắt đúng điều đó), và nó còn một khuyết điểm khác ít ai để ý:
 * mở hai tab rồi đổi theme ở một tab thì tab kia không biết. `useSyncExternalStore` sửa cả hai —
 * nó đọc thẳng từ store và `subscribe` vào event `storage`, nên hai tab đi cùng nhau.
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  // `storage` chỉ bắn ở CÁC TAB KHÁC, không bắn ở tab vừa ghi — nên tab hiện tại dựa vào `emit()`.
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

/**
 * Lựa chọn trong BỘ NHỚ, chỉ dùng khi không ghi được xuống localStorage.
 *
 * Không có nó thì nhánh catch là một lời hứa suông: `emit()` bắn, nhưng `readBrand()` đọc lại store
 * và store chưa đổi, nên theme đứng im. Người dùng ở cửa sổ riêng tư bấm đổi theme và không có gì
 * xảy ra — không lỗi, không phản hồi.
 */
let memory: BrandTheme | null = null;

function readBrand(): BrandTheme {
  if (memory) return memory;
  let saved: string | null = null;
  try {
    // Có thể THROW (cửa sổ riêng tư, site data bị chặn), không chỉ trả null.
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }
  return saved && themeMeta.some((t) => t.name === saved) ? (saved as BrandTheme) : DEFAULT;
}

const serverBrand = () => DEFAULT;

export function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const brand = React.useSyncExternalStore(subscribe, readBrand, serverBrand);

  React.useEffect(() => {
    document.documentElement.dataset.theme = brand;
  }, [brand]);

  const setBrand = React.useCallback((b: BrandTheme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, b);
      memory = null; // ghi được rồi thì store là nguồn sự thật, bỏ bản trong bộ nhớ
    } catch {
      // Không lưu được thì giữ trong bộ nhớ: theme vẫn đổi cho phiên này, chỉ không sống qua reload.
      memory = b;
    }
    emit();
  }, []);

  const value = React.useMemo(() => ({ brand, setBrand, themes: themeMeta }), [brand, setBrand]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useBrandTheme = () => React.useContext(Ctx);
