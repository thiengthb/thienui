'use client';

import { cn } from 'cn';
import { Tabs, TabsList, TabsTrigger } from '@/registry/base/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/registry/base/select';

export interface TabSelectItem {
  value: string;
  label: string;
}

/**
 * Bộ chuyển tab: một `TabsList` khi hộp chứa đủ rộng, một `Select` khi không.
 *
 * TỰ CHỨA: nó dựng `<Tabs>` của chính nó. Trước pha 6 thì không — nó render thẳng `TabsList` /
 * `TabsTrigger` và BẮT BUỘC nằm trong một `<Tabs>` của chỗ gọi, trong khi chữ ký lại nhận
 * `value` + `onValueChange` như một component tự quản. Dùng đúng theo chữ ký thì trang trả về 500
 * (`TabsRootContext is missing`), và khi bọc đúng thì state phải truyền HAI LẦN — `value` của
 * `TabSelect` không có tác dụng gì với nửa tab, vì `TabsTrigger` đọc từ Root.
 *
 * Nên đây là một BỘ NÚT PHÂN ĐOẠN, không phải tab-cho-panel. Cần tab có panel thì ghép thẳng
 * `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` — đó đúng là việc của chúng.
 *
 * VÌ SAO đổi sang select khi hẹp. Một thanh tab tiêu tốn chỗ ngang tỉ lệ với SỐ TAB, trên đúng cái
 * trục đang không có chỗ: màn hình cài đặt của sakubun có sáu tab, ở 360px thì hoặc cuộn ngang (nên
 * tab cần tìm nằm ngoài màn và không có dấu hiệu nào cho biết nó tồn tại) hoặc gãy thành hai dòng
 * trên mọi trang. Một select tốn chỗ tỉ lệ với NHÃN DÀI NHẤT — hằng số theo số lựa chọn — và nó gọi
 * TÊN cái đang chọn, thứ mà thanh tab truyền đạt bằng vị trí và một thanh tab gãy dòng truyền đạt tệ.
 *
 * NHƯNG chỉ khi có NHIỀU tab. Luật `few-tabs-stay-real-tabs`: hai hoặc ba tab thì để tab thật ở mọi
 * bề rộng — hai tab thật là hai thứ người dùng thấy cùng lúc và đổi bằng một cú bấm; gói chúng vào
 * select biến một cú bấm thành hai và che mất lựa chọn còn lại. Ngưỡng ở đây là `collapseFrom`.
 *
 * Dùng CONTAINER QUERY chứ không viewport: thanh tab này hay nằm trong một panel hoặc một card, nên
 * "màn hình rộng" không nói được gì về chỗ nó thật sự có.
 *
 * `@container/tabs` phải nằm trên một phần tử SINH HỘP. Trước pha 6 nó nằm trên một div
 * `display: contents` — phần tử đó không sinh hộp, nên `container-type` không áp dụng, không có
 * container nào tên `tabs`, và **cả hai nửa cùng hiện ở mọi bề rộng**, kể cả 1280px. Nhánh ít-tab
 * thì còn tệ hơn: nó dùng `@max-md/tabs:*` mà không có `@container/tabs` nào trong nhánh đó.
 *
 * Cả hai nửa chạy bằng CÙNG `value` / `onValueChange`, nên tab đang chọn sống sót qua một lần đổi
 * kích thước và chỉ có một nguồn sự thật. Hai nửa cùng được render, mỗi nửa ẩn ở ngưỡng của nửa kia
 * — rẻ hơn đo bằng JS, và không có nhấp nháy ở lần vẽ đầu.
 */
export function TabSelect({
  items,
  value,
  onValueChange,
  label = 'Chọn mục',
  collapseFrom = 4,
  className,
}: {
  items: readonly TabSelectItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Tên cho trình đọc màn hình của select (thanh tab tự có tên từ các tab). */
  label?: string;
  /** Từ bao nhiêu tab trở lên thì mới thu thành select. Dưới ngưỡng: luôn là tab thật. */
  collapseFrom?: number;
  /**
   * Style cho VỎ NGOÀI — và vỏ ngoài chính là cái container đo ngưỡng, nên đây là chỗ nói "tôi
   * được rộng bao nhiêu". Trong một hàng flex, truyền `flex-1`: mặc định `w-full` sẽ chiếm hết
   * hàng và ép mọi thứ bên cạnh về 0.
   */
  className?: string;
}) {
  const alwaysTabs = items.length < collapseFrom;

  if (alwaysTabs) {
    return (
      <div className={cn('@container/tabs w-full', className)}>
        <Tabs value={value} onValueChange={(v: unknown) => onValueChange(String(v))}>
          <TabsList className="@max-md/tabs:w-full">
            {items.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="@max-md/tabs:flex-1">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    );
  }

  return (
    /*
     * `w-full`: ngưỡng phải đo CHỖ CÒN LẠI, không đo chính nó. Một div block làm flex item thì rộng
     * bằng nội dung, nên không có `w-full` thì container tự đo mình — và ở 1280px nó kết luận là
     * "hẹp" rồi thu thành select, trong khi hàng chứa nó rộng cả nghìn pixel. Đo được ở pha 6.
     *
     * Hệ quả cho chỗ gọi: trong một hàng flex, hãy cho nó một ô có bề rộng (`flex-1`, `basis-*`,
     * hoặc một `div` bọc) — nếu không nó sẽ chiếm phần còn lại của hàng.
     */
    <div className={cn('@container/tabs w-full', className)}>
      {/* `items` cho Select.Root là thứ ánh xạ value -> nhãn. Thiếu nó thì ô select in ra chính
          value: người dùng thấy `tat-ca` chứ không thấy "Tất cả". */}
      <Select items={items} value={value} onValueChange={(v: unknown) => onValueChange(String(v))}>
        <SelectTrigger aria-label={label} className="w-full @md/tabs:hidden">
          <SelectValue />
        </SelectTrigger>
        {/* Mở XUỐNG DƯỚI chân control — luật menus-open-below-trigger. */}
        <SelectContent side="bottom" sideOffset={6}>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs value={value} onValueChange={(v: unknown) => onValueChange(String(v))} className="@max-md/tabs:hidden">
        <TabsList>
          {items.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
