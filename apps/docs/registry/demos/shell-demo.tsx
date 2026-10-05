'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/registry/base/button';
import { PageShell } from '@/registry/shells/page-shell';
import { PageSkeleton, TableSkeleton } from '@/registry/shells/page-skeleton';

/**
 * `PageShell` và `PageSkeleton` CẠNH NHAU — đó là cả nội dung của demo này.
 *
 * Hai thứ này tồn tại để không lệch nhau, nên cách duy nhất demo chúng cho đúng là đặt chúng cạnh
 * nhau và để mắt làm việc kiểm. Pha 6 bắt được `PageShell` thiếu hẳn chỗ đặt `<h1>`; nếu nó từng
 * được render ở đây thì không ai bỏ lỡ được điều đó.
 */
export function ShellDemo() {
  const [cho, setCho] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" className="w-fit" onClick={() => setCho((v) => !v)}>
        {cho ? 'Xem trang thật' : 'Xem khung chờ'}
      </Button>

      <div className="rounded-lg border bg-background px-6">
        {cho ? (
          <PageSkeleton hasAside hasDescription>
            <TableSkeleton rows={3} columns={4} />
          </PageSkeleton>
        ) : (
          <PageShell
            title="Thuật ngữ"
            description="Mọi mục đang theo dõi trong bộ này. Sửa một mục sẽ áp cho mọi bộ dùng chung nó."
            headerAside={
              <Button size="sm">
                <Plus /> Thêm mục
              </Button>
            }
          >
            <div className="rounded-lg border border-dashed p-8 text-center text-subhead text-muted-foreground">
              thân trang
            </div>
          </PageShell>
        )}
      </div>
    </div>
  );
}
