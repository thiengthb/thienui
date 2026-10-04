'use client';

import { TabsList, TabsTrigger } from '@/registry/base/tabs';
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
 * Thay thẳng cho một `<TabsList>` viết tay bên trong `<Tabs>` — nó vẫn phải nằm trong provider đó,
 * vì nửa rộng là tab list thật.
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
}: {
  items: readonly TabSelectItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Tên cho trình đọc màn hình của select (thanh tab tự có tên từ các tab). */
  label?: string;
  /** Từ bao nhiêu tab trở lên thì mới thu thành select. Dưới ngưỡng: luôn là tab thật. */
  collapseFrom?: number;
}) {
  const alwaysTabs = items.length < collapseFrom;

  if (alwaysTabs) {
    return (
      <TabsList className="max-@md/tabs:w-full">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="max-@md/tabs:flex-1">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  }

  return (
    <div className="@container/tabs contents">
      <Select value={value} onValueChange={(v) => onValueChange(String(v))}>
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

      <TabsList className="max-@md/tabs:hidden">
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
