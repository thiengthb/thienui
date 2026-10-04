'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
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
 */
export function SearchInput({
  className,
  ...props
}: React.ComponentProps<typeof Input> & { className?: string }) {
  return (
    <div className={cn('@container/search relative w-full', className)}>
      <div className="relative @sm/search:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input type="search" {...props} className="pl-8" />
      </div>
    </div>
  );
}
