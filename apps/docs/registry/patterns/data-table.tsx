'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, TriangleAlert } from 'lucide-react';
import { cn } from 'cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/base/table';
import { Checkbox } from '@/registry/base/checkbox';
import { Button } from '@/registry/base/button';
import { Skeleton } from '@/registry/base/skeleton';
import { EmptyState, NoMatchState } from '@/registry/patterns/empty-state';

/**
 * Bảng dữ liệu.
 *
 * `canonical` của luật `container-query-not-viewport`, và đây là chỗ luật đó có ý nghĩa rõ nhất: một
 * bảng bị đặt trong sidebar hẹp, trong một tab, hay full-width của trang — viewport không nói được
 * gì về chỗ nó thật sự có. Mọi thứ đáp ứng ở đây đi qua `@container/table`.
 *
 * SÁU TRẠNG THÁI DỮ LIỆU là tham số, không phải chuyện người dùng tự lo:
 *   `loading`  -> skeleton có ĐÚNG số cột và đúng chiều cao hàng (giữ layout, không báo tin)
 *   `error`    -> nói chuyện gì sai VÀ cách sửa, kèm nút thử lại
 *   rỗng       -> `EmptyState` (Inbox) — chưa có gì, trang nên giấu cả thanh công cụ
 *   lọc rỗng   -> `NoMatchState` (SearchX) — có dữ liệu, bộ lọc không khớp; PHẢI còn đường xoá lọc
 *   số 0       -> việc của cell: `0` khác `—`, và `{value || '—'}` biến số 0 thành gạch ngang
 *   số rất lớn -> `tabular-nums` + một ngưỡng rút gọn, do cell quyết định
 *
 * Phần CHƯA port từ sakubun (bản ở đó 952 dòng): ẩn/hiện cột, bộ lọc faceted, sheet chi tiết dòng,
 * sắp xếp phía server, cuộn vô hạn. Chúng đáng vay từ `@niko-table` hoặc `@data-table-filters` qua
 * quy trình khu cách ly thay vì viết lại.
 *
 * GHIM `@tanstack/react-table@^8` CÓ CHỦ Ý, dù v9 đã là `latest`. v9 đổi sang kiến trúc feature-based
 * (`useTable` thay `useReactTable`, feature phải truyền tường minh) — một API khác hẳn. Lý do quyết
 * định không phải ngại đổi: HAI registry đã chọn để vay phần còn thiếu, `@niko-table` và
 * `@data-table-filters`, đều nhắm v8. Dùng v9 ở đây là tự cắt đúng con đường mà kế hoạch dựa vào.
 * Khi hệ sinh thái chuyển sang v9 thì đổi — và lúc đó chỉ phải sửa một file.
 *
 * CHI PHÍ CỦA QUYẾT ĐỊNH ĐÓ, ghi ra để lần sau cân lại có dữ liệu: React Compiler bỏ qua component
 * này ("Compilation Skipped: Use of incompatible library"), vì `useReactTable()` của v8 trả về những
 * hàm không memo hoá an toàn được. Nghĩa là bảng không nhận được tối ưu tự động của compiler. Đó là
 * một trong những lý do v9 đổi sang kiến trúc feature-based. Hiện tại đây là cảnh báo, không phải
 * lỗi, và đổi lấy khả năng vay từ hệ sinh thái thì vẫn đáng — nhưng nếu bảng này thành chỗ nghẽn
 * hiệu năng thì đây là chỗ nhìn trước.
 */
export type DataTableState = {
  loading?: boolean;
  /** Thông điệp lỗi. Phải nói chuyện gì sai và sửa thế nào, không chỉ "đã có lỗi xảy ra". */
  error?: string | null;
  onRetry?: () => void;
  /** Bật khi danh sách rỗng VÌ bộ lọc, không phải vì chưa có dữ liệu. Hai trạng thái khác nhau. */
  filtered?: boolean;
  /** Nút xoá bộ lọc. Bắt buộc có khi `filtered` — nếu không người dùng mắc kẹt. */
  onClearFilter?: React.ReactNode;
  /** Hành động cho trạng thái rỗng thật sự: nút tạo, nút nhập. */
  emptyAction?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  selectable = false,
  onSelectionChange,
  renderBulkActions,
  state = {},
  skeletonRows = 8,
  className,
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId?: (row: T, index: number) => string;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  /** Dock hành động bulk. Nhận số dòng đang chọn; tự ẩn khi bằng 0. */
  renderBulkActions?: (selectedIds: string[]) => React.ReactNode;
  state?: DataTableState;
  skeletonRows?: number;
  className?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const allColumns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!selectable) return columns;
    const selectCol: ColumnDef<T, unknown> = {
      id: '__select',
      size: 36,
      header: ({ table }) => (
        // Base UI tách `indeterminate` thành PROP RIÊNG, không nhận chuỗi 'indeterminate' trong
        // `checked` như Radix. Khác biệt này đúng hơn: một ô vừa "chưa tick" vừa "một phần" là hai
        // thông tin khác nhau, và gộp vào một giá trị làm mất khả năng diễn tả "đã tick + một phần".
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(v === true)}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(v === true)}
          aria-label="Chọn dòng"
        />
      ),
    };
    return [selectCol, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: selectable,
    ...(getRowId ? { getRowId } : {}),
  });

  const selectedIds = React.useMemo(
    () => table.getSelectedRowModel().rows.map((r) => r.id),
    // `rowSelection` là thứ thật sự đổi; `table` thì ổn định giữa các lần render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowSelection, table]
  );

  // Báo lựa chọn ra ngoài TRONG effect, không trong lúc render: gọi callback của cha giữa chừng
  // render con là một lần setState lồng, và React sẽ cảnh báo đúng.
  const notify = React.useRef(onSelectionChange);
  notify.current = onSelectionChange;
  React.useEffect(() => {
    notify.current?.(selectedIds);
  }, [selectedIds]);

  const colCount = allColumns.length;

  return (
    <div className={cn('@container/table flex flex-col gap-3', className)}>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() || undefined }}>
                      {header.isPlaceholder ? null : sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={header.column.getToggleSortingHandler()}
                          // Trình đọc màn hình cần biết CHIỀU sắp xếp, không chỉ biết nút sắp xếp được.
                          aria-label={`Sắp xếp theo cột này${dir ? `, đang ${dir === 'asc' ? 'tăng' : 'giảm'}` : ''}`}
                          className="-ml-2 h-7"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {dir === 'asc' ? (
                            <ArrowUp data-icon="inline-end" />
                          ) : dir === 'desc' ? (
                            <ArrowDown data-icon="inline-end" />
                          ) : (
                            <ChevronsUpDown data-icon="inline-end" className="opacity-50" />
                          )}
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {state.loading ? (
              // Skeleton có ĐÚNG số cột và đúng chiều cao hàng — nó giữ layout, không báo tin.
              Array.from({ length: skeletonRows }, (_, r) => (
                <TableRow key={`sk-${r}`}>
                  {Array.from({ length: colCount }, (_, c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : state.error ? (
              <TableRow>
                <TableCell colSpan={colCount} className="p-0">
                  <EmptyState
                    icon={TriangleAlert}
                    title="Không tải được dữ liệu"
                    description={state.error}
                    action={
                      state.onRetry ? (
                        <Button variant="secondary" size="sm" onClick={state.onRetry}>
                          Thử lại
                        </Button>
                      ) : null
                    }
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="p-0">
                  {state.filtered ? (
                    <NoMatchState onClear={state.onClearFilter} className="border-0" />
                  ) : (
                    <EmptyState
                      title={state.emptyTitle ?? 'Chưa có dữ liệu'}
                      description={state.emptyDescription ?? 'Thêm mục đầu tiên để bắt đầu.'}
                      action={state.emptyAction}
                      className="border-0"
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="max-w-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {renderBulkActions ? renderBulkActions(selectedIds) : null}
    </div>
  );
}

/**
 * Ô số. Tách ra vì hai trong sáu trạng thái dữ liệu sống ở ĐÂY, và cả hai hay bị bỏ.
 *
 * SỐ 0 — `{value || '—'}` biến số 0 thành gạch ngang, và đó là một lỗi dữ liệu thật: "0 mục đến hạn"
 * là một câu trả lời, "—" là "không biết". Phải so với `null`/`undefined`, không dùng falsy.
 *
 * SỐ RẤT LỚN — `tabular-nums` để chữ số thẳng cột, cộng một ngưỡng rút gọn để một giá trị ngoại lai
 * không kéo giãn cả cột. Không có hai thứ đó thì một hàng 1.234.567 làm lệch toàn bộ bảng.
 */
export function NumberCell({
  value,
  compactFrom = 1_000_000,
  locale = 'vi-VN',
}: {
  value: number | null | undefined;
  compactFrom?: number;
  locale?: string;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  const compact = Math.abs(value) >= compactFrom;
  return (
    <span className="tabular-nums">
      {new Intl.NumberFormat(locale, compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}).format(value)}
    </span>
  );
}
