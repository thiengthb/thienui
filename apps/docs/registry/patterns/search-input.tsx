'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/registry/base/button';
import { cn } from 'cn';
import { Input } from '@/registry/base/input';

/**
 * MỘT ô tìm kiếm cho cả app — bảng, nhóm, thư viện, lịch sử, picker.
 *
 * Gom về một chỗ để bề rộng, chiều cao và cái kính lúp giống hệt nhau ở mọi nơi và đổi được ở một
 * chỗ. `className` style cho VỎ NGOÀI, không cho input — truyền bề rộng vào đây để ghi đè mặc định.
 *
 * Bề rộng dùng CONTAINER QUERY (`@sm:max-w-xs`) chứ không dùng breakpoint viewport. Khác biệt là
 * thật: ô này hay nằm trong một toolbar hẹp, trong một dialog, hoặc trong một cột của grid — theo
 * viewport thì nó tràn ra khỏi hộp chứa trên màn hình rộng, dù hộp đó chỉ 300px.
 *
 * Icon là trang trí (`pointer-events-none`, `aria-hidden`) và input chừa padding trái cho nó. Để icon
 * nhận được chuột sẽ làm bấm vào nó không focus vào ô.
 *
 * HAI THỨ pha 6 bắt được là thiếu, vì mọi ô tìm kiếm thật đều phải viết lại chúng bằng tay:
 *
 * · **Nút xoá.** `type="search"` có nút × của trình duyệt, nhưng chỉ ở một số trình duyệt, và nó
 *   không nhận được style, không nhận được tên cho trình đọc màn hình. Ô tìm kiếm không có đường
 *   xoá là ô có thể làm người dùng mắc kẹt với một bộ lọc không khớp — đúng lỗi mà `NoMatchState`
 *   được dựng ra để chặn ở phía kia.
 *
 * · **Debounce.** `onValueChange` nhận `debounceMs`. Lọc trên mảng trong bộ nhớ thì không cần, và
 *   mặc định là 0 vì vậy; nhưng cái nào gọi API thì cần, và "cái nào gọi API" là thứ không nhìn ra
 *   được từ chỗ này. Khi `debounceMs > 0`, ô giữ chữ hiện trên màn hình trong state của nó và chỉ
 *   báo ra ngoài sau khi người dùng ngừng gõ — nên chữ không bao giờ nhảy lùi.
 */
export function SearchInput({
  className,
  value,
  onValueChange,
  debounceMs = 0,
  clearLabel = 'Xoá ô tìm kiếm',
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'value'> & {
  className?: string;
  value?: string;
  /** Nhận CHỮ, không nhận event — cùng quy ước với `TabSelect`. `onChange` vẫn chạy như cũ. */
  onValueChange?: (value: string) => void;
  /** 0 = báo ngay. Đặt > 0 khi mỗi lần gõ gọi mạng. */
  debounceMs?: number;
  clearLabel?: string;
}) {
  const [nhap, setNhap] = React.useState(value ?? '');
  const hienThi = debounceMs > 0 ? nhap : (value ?? nhap);

  /*
   * Prop `value` đổi từ BÊN NGOÀI (xoá bộ lọc, nạp lại từ URL) phải kéo chữ đang hiện theo.
   *
   * ĐIỀU CHỈNH TRONG LÚC RENDER, không đồng bộ bằng effect. Effect thì chạy SAU khi trình duyệt đã
   * vẽ, nên sẽ có một khung hình hiện chữ cũ; và `react-hooks/set-state-in-effect` chặn đúng mẫu
   * đó. Gọi `setState` trong thân render khi state phái sinh từ prop là cách React khuyến nghị:
   * React bỏ kết quả render dở và chạy lại ngay, trước khi vẽ.
   */
  const [truocDo, setTruocDo] = React.useState(value);
  if (value !== truocDo) {
    setTruocDo(value);
    setNhap(value ?? '');
  }

  const baoRa = React.useRef(onValueChange);
  React.useEffect(() => {
    baoRa.current = onValueChange;
  });

  /*
   * Chỉ báo ra khi chữ KHÁC giá trị đã biết. Trước đây effect debounce chạy cả lúc vừa mount và
   * báo lại đúng giá trị ban đầu sau `debounceMs` — trang nào nối `onValueChange` vào điều hướng
   * (bộ lọc trên URL) sẽ tự điều hướng về chính nó, đè lên cú bấm link của người dùng trong khoảng
   * đó. Lộ ra ở capstone-hub: bấm "Tạo nhóm" ngay sau khi trang Tìm nhóm mở thì không đi đâu cả.
   *
   * `daBao` = giá trị bên ngoài đã biết: cập nhật khi prop `value` đổi (effect này khai TRƯỚC effect
   * debounce nên chạy trước trong cùng lần commit) và khi chính ta báo ra.
   */
  const daBao = React.useRef(value ?? '');
  React.useEffect(() => {
    daBao.current = value ?? '';
  }, [value]);

  React.useEffect(() => {
    if (debounceMs <= 0 || nhap === daBao.current) return;
    const t = setTimeout(() => {
      daBao.current = nhap;
      baoRa.current?.(nhap);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [nhap, debounceMs]);

  function doi(v: string) {
    setNhap(v);
    if (debounceMs <= 0) onValueChange?.(v);
  }

  return (
    <div className={cn('@container/search relative w-full', className)}>
      <div className="relative @sm/search:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={hienThi}
          onChange={(e) => {
            doi(e.target.value);
            onChange?.(e);
          }}
          {...props}
          className="pl-8 pr-9"
        />
        {hienThi ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={clearLabel}
            className="absolute top-1/2 right-0.5 size-8 -translate-y-1/2 text-muted-foreground"
            onClick={() => doi('')}
          >
            <X />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
