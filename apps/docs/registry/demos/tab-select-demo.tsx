'use client';

import * as React from 'react';
import { TabSelect } from '@/registry/patterns/tab-select';

const IT = [
  { value: 'tat-ca', label: 'Tất cả' },
  { value: 'dang-hoc', label: 'Đang học' },
  { value: 'da-thuoc', label: 'Đã thuộc' },
];
const NHIEU = [
  ...IT,
  { value: 'bo-qua', label: 'Bỏ qua' },
  { value: 'can-on', label: 'Cần ôn' },
  { value: 'luu-tru', label: 'Lưu trữ' },
];

/**
 * Hai NGƯỠNG cạnh nhau, và một khung hẹp để thấy nửa select.
 *
 * Demo này ra đời sau pha 6: `tab-select` trước đó chưa từng được render ở đâu, và nó mang BA lỗi
 * cùng lúc — crash vì thiếu `<Tabs>`, container query không hoạt động nên cả hai nửa cùng hiện, và
 * ô select in ra `tat-ca` thay vì "Tất cả". Không lỗi nào cần hơn một lần nhìn để thấy.
 */
export function TabSelectDemo() {
  const [a, setA] = React.useState('tat-ca');
  const [b, setB] = React.useState('tat-ca');

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <p className="text-caption1 text-muted-foreground">
          Ba mục — dưới ngưỡng `collapseFrom`, nên luôn là tab thật ở mọi bề rộng.
        </p>
        <TabSelect items={IT} value={a} onValueChange={setA} />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption1 text-muted-foreground">
          Sáu mục, hộp chứa rộng — tab thật.
        </p>
        <TabSelect items={NHIEU} value={b} onValueChange={setB} />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption1 text-muted-foreground">
          Cùng sáu mục, hộp chứa 280px — thu thành select. Đây là chỗ container query phải hoạt động:
          khung hẹp, KHÔNG phải màn hình hẹp.
        </p>
        <div className="w-70 rounded-lg border border-dashed p-3">
          <TabSelect items={NHIEU} value={b} onValueChange={setB} label="Lọc thẻ" />
        </div>
      </section>
    </div>
  );
}
