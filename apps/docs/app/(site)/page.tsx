import Link from 'next/link';
import { ArrowRight, ShieldCheck, Layers, Palette } from 'lucide-react';
import tokens from '@thienui/tokens/tokens.json';
import patterns from '@thienui/ui-patterns/ui-patterns.json';
import { listRegistry } from '@/lib/registry-index';
import { hasDemo } from '@/registry/demos';
import { Button } from '@/registry/base/button';

type Reg = { patterns: { id: string; check: { kind: string } }[] };
const RULES = (patterns as unknown as Reg).patterns;

export default function HomePage() {
  const items = listRegistry();
  const auto = RULES.filter((p) => p.check.kind !== 'manual').length;
  const semantic = Object.keys(tokens.themes.claude.light).length;
  const themes = tokens.meta.length;

  const cards = [
    {
      href: '/tokens',
      icon: Palette,
      title: 'Token',
      lead: `${semantic} token ngữ nghĩa × ${themes} theme × 2 mode`,
      body: 'Ba tầng, một chiều. Tên tầng semantic trùng chính xác shadcn, nên component shadcn nguyên bản chạy không cần sửa. Theme thứ hai được SINH từ theme thứ nhất bằng phép thay ramp — đó là bài kiểm tra cho tầng primitive.',
    },
    {
      href: '/components',
      icon: Layers,
      title: 'Component',
      lead: `${items.length} item · ${items.filter((i) => hasDemo(i.name)).length} có demo`,
      body: 'Bốn tầng, và thứ tự tầng cũng là thứ tự phụ thuộc được phép. Primitive trên @base-ui/react là code vendor — shadcn add ghi đè nó, nên nó là ranh giới chứ không phải code của ta.',
    },
    {
      href: '/tokens#cổng-tương-phản',
      icon: ShieldCheck,
      title: 'Cổng',
      lead: `296 cặp contrast · ${auto} luật máy kiểm`,
      body: 'Một "yêu cầu thẩm mỹ" biến thành một check tất định: OKLCH → sRGB → độ sáng tương đối, thuần số học, không browser, không LLM chấm ảnh. Sửa cho cổng im tiếng thì nó không còn là cổng.',
    },
  ];

  return (
    <div className="@container flex flex-col gap-12">
      <header className="flex flex-col gap-5">
        <h1 className="max-w-prose text-large-title font-semibold tracking-tight">
          Token, luật UI và component — đo một lần, dùng cho mọi project sau.
        </h1>
        <p className="max-w-prose text-callout text-muted-foreground">
          Trích từ <code>sakubun</code>, đặt trên shadcn registry, siết bằng test chứ không bằng lời nhắc.
          Component đi qua registry để mỗi project <strong className="text-foreground">sở hữu</strong> code và
          được quyền lệch; token và cổng đi qua npm vì chúng{' '}
          <strong className="text-foreground">bắt buộc</strong> đồng nhất.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/components" />}>
            Xem component
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button variant="secondary" nativeButton={false} render={<Link href="/tokens" />}>
            Xem token
          </Button>
        </div>
      </header>

      <div className="grid gap-4 @2xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <c.icon className="size-5 text-accent-brand" aria-hidden />
            <h2 className="text-subhead font-semibold">{c.title}</h2>
            <p className="text-footnote tabular-nums text-accent-brand">{c.lead}</p>
            <p className="text-footnote text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-5">
        <h2 className="text-subhead font-semibold">Dùng trong một project mới</h2>
        <pre className="overflow-x-auto rounded-lg border bg-card p-4 text-caption1">
          <code>{`pnpm dlx shadcn@latest init -t next -b base -p nova
pnpm add -D @thienui/guards @thienui/tokens @thienui/ui-patterns
pnpm dlx shadcn@latest add @thienui/theme-claude @thienui/sidebar`}</code>
        </pre>
        <p className="max-w-prose text-footnote text-muted-foreground">
          Lệnh thứ hai là chỗ 36 luật UI và cổng contrast tự gắn vào <code>pnpm test</code> của project mới.
          Bạn không phải nhắc lại luật nào — và agent cũng không, vì hook hiện toàn bộ luật trước lần ghi UI
          đầu tiên của mỗi phiên.
        </p>
      </section>
    </div>
  );
}
