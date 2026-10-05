'use client';

import * as React from 'react';
import {
  columnSizingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  flexRender,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
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
 * DÙNG `@tanstack/react-table@^9`, kiến trúc feature-based: feature phải đăng ký tường minh, nên chỉ
 * những gì bảng này thật sự dùng mới vào bundle.
 *
 * SỬA MỘT QUYẾT ĐỊNH SAI Ở PHA 4. Lúc đó file này ghim v8, và lý do đã viết ra là "hai registry đã
 * chọn để vay (@niko-table, @data-table-filters) đều nhắm v8". Điều đó KHÔNG ĐÚNG — kiểm lại ở pha 5
 * thì cả hai đều khai `@tanstack/react-table@^9`. Nên lập luận duy nhất chống đỡ cho v8 là một sự
 * thật sai, trong khi nó có hai cái giá đã biết: React Compiler bỏ qua component ("Use of
 * incompatible library", vì `useReactTable()` của v8 trả về hàm không memo hoá an toàn được), và
 * cánh cửa vay từ hệ sinh thái thì đóng chứ không mở.
 *
 * Bài học đáng giữ hơn cả bản migrate: lý do đã viết ra vẫn có thể sai. Nó chỉ lộ ra khi có người đi
 * kiểm cái nguồn mà nó viện dẫn — ở đây là lúc thật sự mở `@niko-table` ra xem, chứ không phải lúc
 * viết lý do.
 */
/**
 * Feature đăng ký TƯỜNG MINH — đây là điểm khác lớn nhất của v9. v8 gói sẵn mọi feature; v9 chỉ mở
 * API khi feature có mặt ở đây, nên bundle chỉ mang thứ bảng này dùng.
 *
 * Khai NGOÀI component: nó là hằng số, dựng lại mỗi lần render là dựng lại cả bộ feature.
 */
const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  // `columnSizingFeature` mở `column.size` / `header.getSize()`; `columnVisibilityFeature` mở
  // `row.getVisibleCells()`. Ở v8 hai thứ này có sẵn nên không ai biết mình đang dùng feature gì —
  // v9 bắt khai, và đó chính là cách nó cắt được bundle.
  columnSizingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  // Chỉ đăng ký built-in mà cột thật sự gọi tới bằng tên chuỗi. Đăng ký cả registry thì bundle mang
  // theo mọi hàm sắp xếp, kể cả những cái không ai dùng.
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

/**
 * Kiểu cột, đã gắn sẵn bộ feature của bảng này.
 *
 * v9 đưa `TFeatures` vào generic của `ColumnDef`, nên một `ColumnDef` khai với bộ feature khác sẽ
 * không gán được. Xuất alias này để chỗ gọi không phải biết về `tableFeatures` — và để khi bảng thêm
 * một feature, mọi file cột được TypeScript cập nhật theo chứ không âm thầm lệch.
 */
export type TableFeaturesUsed = typeof features;
export type Column<T extends RowData> = ColumnDef<TableFeaturesUsed, T, unknown>;

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

export function DataTable<T extends RowData>({
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
  columns: Column<T>[];
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

  const allColumns = React.useMemo<Column<T>[]>(() => {
    if (!selectable) return columns;
    const selectCol: Column<T> = {
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

  const table = useTable({
    features,
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selectable,
    ...(getRowId ? { getRowId } : {}),
  });

  /*
   * Dẫn xuất THẲNG từ `rowSelection`, không hỏi `table`.
   *
   * Bản trước gọi `table.getSelectedRowModel()` và khai `[rowSelection, table]`, kèm một lời giải
   * thích rằng "`table` thì ổn định giữa các lần render". **Lời giải thích đó sai**, và cái giá là
   * một vòng lặp vô tận: `useTable` của v9 trả một object MỚI mỗi lần render → `selectedIds` là
   * mảng mới mỗi lần render → effect báo ra ngoài chạy mỗi lần render → cha `setState` → render lại
   * → … Trình duyệt báo "Maximum update depth exceeded", và không có gì trong typecheck, lint hay
   * build nhìn thấy nó.
   *
   * Khoá của `rowSelection` CHÍNH LÀ row id (chúng do `getRowId` sinh ra), nên không cần `table` để
   * biết dòng nào đang chọn. Phụ thuộc vào state thay vì vào một instance là cách duy nhất làm cho
   * identity ổn định mà không phải tin vào một giả định về thư viện.
   */
  const selectedIds = React.useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  );

  // Báo lựa chọn ra ngoài TRONG effect, không trong lúc render: gọi callback của cha giữa chừng
  // render con là một lần setState lồng.
  //
  // Ref được cập nhật trong MỘT EFFECT RIÊNG, không gán thẳng trong thân component. Ghi vào ref lúc
  // render là một side effect trong pha render — React có thể render lại mà không commit, và khi đó
  // ref đã mang giá trị của một lần render bị vứt đi. Mẫu "latest ref" chỉ đúng khi phần ghi nằm
  // trong effect; viết tắt ở thân component là chỗ nó âm thầm sai.
  const notify = React.useRef(onSelectionChange);
  React.useEffect(() => {
    notify.current = onSelectionChange;
  });
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
