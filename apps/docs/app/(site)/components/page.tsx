import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { listRegistry, TIER_LABEL, type Tier } from '@/lib/registry-index';
import { hasDemo } from '@/registry/demos';
import { Badge } from '@/registry/base/badge';

export const metadata = { title: 'Component' };

export default function ComponentsPage() {
  const items = listRegistry();
  const byTier = (t: Tier) => items.filter((i) => i.tier === t);
  const withDemo = items.filter((i) => hasDemo(i.name)).length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-title1 font-semibold tracking-tight">Component</h1>
        <p className="max-w-prose text-muted-foreground">
          {items.length} item trong registry, chia bốn tầng. Thứ tự tầng cũng là thứ tự phụ thuộc được phép:
          một pattern được dùng primitive, primitive không được dùng pattern.
        </p>
        <p className="max-w-prose text-subhead text-muted-foreground">
          <strong className="text-foreground">{withDemo}</strong> trong số đó có demo khai sẵn. Phần còn lại
          hiện rõ là <em>chưa có</em> — nợ nhìn thấy được thì còn trả được.
        </p>
      </header>

      {(Object.keys(TIER_LABEL) as Tier[]).map((tier) => {
        const list = byTier(tier);
        const meta = TIER_LABEL[tier];
        return (
          <section key={tier} className="@container flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 border-b pb-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-title3 font-semibold tracking-snug">{meta.label}</h2>
                <Badge variant="secondary" className="tabular-nums">
                  {list.length}
                </Badge>
              </div>
              <p className="max-w-prose text-footnote text-muted-foreground">{meta.note}</p>
            </div>

            {list.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-footnote text-muted-foreground">
                Chưa có item nào ở tầng này.
              </p>
            ) : (
              <ul className="grid gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
                {list.map((item) => {
                  const demo = hasDemo(item.name);
                  return (
                    <li key={item.name}>
                      <Link
                        href={`/components/${item.name}`}
                        className="flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <span className="min-w-0 flex-1 truncate text-footnote font-medium">{item.name}</span>
                        {item.isHook ? (
                          <Badge variant="outline" className="shrink-0">
                            hook
                          </Badge>
                        ) : null}
                        {demo ? (
                          <Check className="size-4 shrink-0 text-ok" aria-label="có demo" />
                        ) : (
                          <Minus className="size-4 shrink-0 text-muted-foreground" aria-label="chưa có demo" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
