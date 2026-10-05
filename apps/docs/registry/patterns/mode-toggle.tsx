'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/registry/base/button';

/**
 * Công tắc SÁNG/TỐI.
 *
 * Có mặt vì pha 6 phát hiện một lỗ hổng trọn vẹn: theme sinh ra cả khối `.dark { … }` với 46 token
 * và `@custom-variant dark`, nhưng **không item nào** đặt class `dark` lên `<html>`. Nửa công sức
 * làm bảng màu tối chỉ dùng được nếu người ta tự viết phần còn lại.
 *
 * Và phần khó không phải cái nút — nó là `MODE_SCRIPT`. Nếu chế độ chỉ được áp sau khi React
 * hydrate thì lần sơn ĐẦU TIÊN luôn là theme sai, rồi nháy một nhịp. Không `useEffect` nào sửa
 * được, vì nó chạy sau khi trình duyệt đã vẽ.
 *
 * `useSyncExternalStore` chứ không `useState` + `useEffect`:
 *   · không có nhịp render thừa với giá trị sai
 *   · React 19 báo `set-state-in-effect` cho cách kia
 *   · và nó cho không một thứ: sự kiện `storage` đồng bộ hai tab đang mở
 *
 * Nguồn sự thật là DOM (`<html class="dark">`), không phải một state React. DOM là thứ script
 * trong `<head>` vừa ghi, nên đọc từ đó thì không có hai nguồn để lệch nhau.
 */
const KEY = 'thienui-mode';

type Mode = 'light' | 'dark';

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function subscribe(cb: () => void) {
  subs.add(cb);
  window.addEventListener('storage', emit);
  return () => {
    subs.delete(cb);
    window.removeEventListener('storage', emit);
  };
}

const doc = (): Mode => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

/** Server không có DOM. Trả `light` để HTML đầu tiên ổn định; `MODE_SCRIPT` sửa trước khi vẽ. */
const onServer = (): Mode => 'light';

export function useMode(): [Mode, (next: Mode) => void] {
  const mode = React.useSyncExternalStore(subscribe, doc, onServer);
  const set = React.useCallback((next: Mode) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Chế độ riêng tư chặn localStorage. Vẫn đổi được trong tab này, chỉ là không nhớ.
    }
    emit();
  }, []);
  return [mode, set];
}

export function ModeToggle({ className }: { className?: string }) {
  const [mode, set] = useMode();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => set(mode === 'dark' ? 'light' : 'dark')}
      aria-label={mode === 'dark' ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
    >
      {mode === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}

/**
 * Đặt vào `<head>` dưới dạng script INLINE, trước mọi thứ khác:
 *
 *   <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
 *
 * Và `<html suppressHydrationWarning>` — vì script này sửa class của `<html>` trước khi React so
 * sánh, nên không có nó React sẽ báo lệch hydration ở đúng chỗ ta cố ý làm lệch.
 */
export const MODE_SCRIPT = `(function(){try{var m=localStorage.getItem('${KEY}');var d=m?m==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;
