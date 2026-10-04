'use client';

import * as React from 'react';
import { Trash2, Archive, Star } from 'lucide-react';
import { DataTable, NumberCell, type Column } from '@/registry/patterns/data-table';
import { BulkActionButton, BulkActionDock } from '@/registry/patterns/bulk-action-button';
import { Truncate } from '@/registry/base/truncate';
import { Button } from '@/registry/base/button';
import { ToggleGroup, ToggleGroupItem } from '@/registry/base/toggle-group';

type Row = { id: string; term: string; note: string; reviews: number | null };

const ROWS: Row[] = [
  { id: '1', term: 'ưu tiên', note: 'xếp trước những việc khác', reviews: 12 },
  { id: '2', term: 'ràng buộc', note: 'điều kiện không được phá', reviews: 0 },
  { id: '3', term: 'đồng tâm', note: 'góc trong = góc ngoài − padding', reviews: 1_284_591 },
  {
    id: '4',
    term: 'một thuật ngữ rất dài để xem chữ tràn thì component xử lý thế nào trong một ô hẹp',
    note: 'mô tả cũng dài không kém, để kiểm cả hai cột cùng lúc chứ không chỉ một cột',
    reviews: 7,
  },
];

const COLUMNS: Column<Row>[] = [
  {
    accessorKey: 'term',
    header: 'Thuật ngữ',
    // Truncate CÓ ĐO: tooltip chỉ hiện khi chữ thật sự tràn.
    cell: ({ row }) => <Truncate className="font-medium">{row.original.term}</Truncate>,
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
    cell: ({ row }) => <Truncate className="text-muted-foreground">{row.original.note}</Truncate>,
  },
  {
    accessorKey: 'reviews',
    header: 'Lượt ôn',
    // Số 0 và số rất lớn — hai trạng thái dữ liệu sống ở đây.
    cell: ({ row }) => <NumberCell value={row.original.reviews} />,
  },
];

const STATES = ['bình thường', 'đang tải', 'lỗi', 'rỗng', 'lọc rỗng'] as const;
type State = (typeof STATES)[number];

/**
 * Demo `DataTable` — và là chỗ DUY NHẤT trên trang showcase mà sáu trạng thái dữ liệu được render
 * thật chứ không chỉ liệt kê. Năm trong sáu cái đó không bao giờ xuất hiện khi dev chạy với dữ liệu
 * mẫu, nên một bảng chấm bằng chữ không đủ — phải bấm được vào từng cái.
 */
export function DataTableDemo() {
  const [state, setState] = React.useState<State>('bình thường');
  const [selected, setSelected] = React.useState<string[]>([]);

  const empty = state === 'rỗng' || state === 'lọc rỗng';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-caption1 text-muted-foreground">Trạng thái:</span>
        <ToggleGroup
          value={[state]}
          onValueChange={(v) => v[0] && setState(v[0] as State)}
          aria-label="Chọn trạng thái dữ liệu"
        >
          {STATES.map((s) => (
            <ToggleGroupItem key={s} value={s} size="sm">
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <DataTable
        data={empty ? [] : ROWS}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        selectable
        onSelectionChange={setSelected}
        state={{
          loading: state === 'đang tải',
          error: state === 'lỗi' ? 'Máy chủ không phản hồi. Kiểm tra kết nối rồi thử lại.' : null,
          onRetry: () => setState('bình thường'),
          filtered: state === 'lọc rỗng',
          onClearFilter: (
            <Button variant="secondary" size="sm" onClick={() => setState('bình thường')}>
              Xoá bộ lọc
            </Button>
          ),
          emptyAction: <Button size="sm">Thêm mục đầu tiên</Button>,
        }}
        renderBulkActions={(ids) => (
          <BulkActionDock count={ids.length}>
            <BulkActionButton icon={<Star />} label="Đánh dấu sao" />
            <BulkActionButton icon={<Archive />} label="Lưu trữ" />
            <BulkActionButton icon={<Trash2 />} label="Xoá" variant="destructive" />
          </BulkActionDock>
        )}
      />

      <p className="text-caption1 text-muted-foreground">
        Chọn vài dòng để thấy <strong className="text-foreground">dock hành động bulk</strong> nổi ở mép
        phải — nó không nằm trong luồng, nên bảng không co lại mỗi lần chọn.{' '}
        {selected.length > 0 ? `Đang chọn ${selected.length}.` : null}
      </p>
      <p className="text-caption1 text-muted-foreground">
        Cột <em>Lượt ôn</em> có cả <strong className="text-foreground">số 0</strong> (phải ra “0”, không
        ra “—”) và <strong className="text-foreground">số rất lớn</strong> (rút gọn + tabular-nums). Hàng
        thứ tư có <strong className="text-foreground">chữ dài tràn</strong> ở cả hai cột.
      </p>
    </div>
  );
}
