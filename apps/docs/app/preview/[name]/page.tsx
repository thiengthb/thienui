import { notFound } from 'next/navigation';
import { listRegistry, findItem } from '@/lib/registry-index';
import { hasDemo } from '@/registry/demos';
import { DemoMatrix } from '@/components/demo-matrix';

export function generateStaticParams() {
  return listRegistry().map((i) => ({ name: i.name }));
}

/**
 * Preview CÁCH LY — không header, không nav, không max-width của site.
 *
 * Tồn tại riêng vì ba lý do, và lý do thứ ba mới là lý do chính:
 *  1. Trang docs nhúng nó qua iframe, nên component chịu đúng CONTAINER QUERY thật thay vì một bản
 *     mô phỏng bằng cách bóp một div.
 *  2. Không có chrome nào ở trên nên ảnh chụp so sánh (Playwright) không đỏ vì header đổi.
 *  3. Nó là chỗ duy nhất component được render MÀ KHÔNG có CSS nào của site xung quanh — nếu một
 *     component chỉ trông đúng trong trang docs thì nó đang mượn style từ trang docs, và project
 *     tiêu thụ sẽ nhận một component khác với cái họ thấy trên demo.
 */
export default async function PreviewPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const item = findItem(name);
  if (!item) notFound();

  return (
    <div className="@container min-h-svh bg-background p-6 text-foreground">
      {hasDemo(name) ? (
        <DemoMatrix name={name} />
      ) : (
        <p className="text-footnote text-muted-foreground">
          <code>{name}</code> chưa có demo khai trong <code>registry/demos/index.tsx</code>.
        </p>
      )}
    </div>
  );
}
