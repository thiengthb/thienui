'use client';

import * as React from 'react';
import { usePressDepth } from '@/registry/lib/motion';

/**
 * Thêm PRESS DEPTH cho một control bất kỳ, không phải sửa chính control đó.
 *
 * Đây là câu trả lời cho một căng thẳng có thật trong kiến trúc này. `@seamui` giải bài cảm giác
 * bằng cách SỞ HỮU component: mỗi nút, mỗi toggle là bản của họ, có press depth dựng sẵn bên trong.
 * Ở đây thì `registry/base/**` là RANH GIỚI VENDOR — `shadcn add` ghi đè nó, nên mọi sửa đổi trong
 * đó sẽ bị xoá ở lần cập nhật sau, âm thầm, trong khi test vẫn xanh.
 *
 * Hai lựa chọn đều có giá:
 *   · nhận bộ component của seam  -> hai bộ primitive song song, và tầng base không còn là một
 *   · thêm cảm giác từ BÊN NGOÀI  -> một lớp bọc nữa trong cây, và không phải prop nào cũng xuyên qua
 *
 * Chọn cái thứ hai, vì cái giá của nó là cục bộ và nhìn thấy được, còn cái giá của cái thứ nhất thì
 * phát tác dần: lần sau `shadcn add` một component mới, nó sẽ không có cảm giác, và không ai nhớ ra.
 *
 * `asChild` ở đây không chèn phần tử DOM nào — nó clone con và GỘP props. Nên con phải là một phần
 * tử nhận được event handler (một DOM element, hoặc component spread props xuống, như mọi component
 * của shadcn).
 *
 * KHÔNG dùng cho item trong composite của Base UI (Toolbar, ToggleGroup, Tabs, Menubar): chúng đăng
 * ký qua ref và một lớp bọc sẽ phá đăng ký. Ở đó gọi thẳng `usePressDepth` trong prop `render`.
 */
export function Pressable({
  children,
  disabled = false,
}: {
  /** Một phần tử duy nhất, nhận được pointer/keyboard handler. */
  children: React.ReactElement;
  disabled?: boolean;
}) {
  const withPress = usePressDepth(disabled);

  // `children.props` là `unknown` với React 19 types; ép về dạng props mà merger cần.
  const childProps = (children.props ?? {}) as Record<string, unknown>;
  return React.cloneElement(children, withPress(childProps));
}
