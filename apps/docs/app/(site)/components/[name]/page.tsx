import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { findItem, listRegistry, readSource, exportNames, TIER_LABEL } from '@/lib/registry-index';
import { hasDemo } from '@/registry/demos';
import { DemoMatrix } from '@/components/demo-matrix';
import { CopyCommand } from '@/components/copy-command';
import { Badge } from '@/registry/base/badge';
import { Button } from '@/registry/base/button';

export function generateStaticParams() {
  return listRegistry().map((i) => ({ name: i.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: name };
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const item = findItem(name);
  if (!item) notFound();

  const src = readSource(item);
  const exports = exportNames(src);
  const demo = hasDemo(name);
  const tier = TIER_LABEL[item.tier];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/components" />}>
          <ArrowLeft data-icon="inline-start" />
          Component
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-title1 font-semibold tracking-tight">{name}</h1>
          <Badge variant="secondary">{tier.label}</Badge>
          {item.isHook ? <Badge variant="outline">hook</Badge> : null}
        </div>
        <p className="max-w-prose text-footnote text-muted-foreground">{tier.note}</p>
        <CopyCommand name={name} />
      </header>

      {exports.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-subhead font-semibold">Export</h2>
          <div className="flex flex-wrap gap-1.5">
            {exports.map((e) => (
              <code key={e} className="rounded-sm bg-muted px-1.5 py-0.5 text-caption1">
                {e}
              </code>
            ))}
          </div>
        </section>
      ) : null}

      {demo ? (
        <DemoMatrix name={name} />
      ) : (
        <section className="flex flex-col gap-3 rounded-lg border border-dashed p-6">
          <h2 className="text-subhead font-semibold">Chưa có demo</h2>
          <p className="max-w-prose text-footnote text-muted-foreground">
            Component có trong registry và cài được, nhưng chưa có demo khai trong{' '}
            <code>registry/demos/index.tsx</code>. Đây là nợ đã biết, không phải lỗi — và nó hiện ra ở đây
            thay vì ẩn đi, nên còn trả được.
          </p>
          <p className="max-w-prose text-footnote text-muted-foreground">
            Component có hành vi ghép (Dialog, Combobox, Calendar, Progress) không khai được bằng spec
            <code> variants × sizes</code>; chúng cần một render riêng.
          </p>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 border-b pb-2">
          <h2 className="text-subhead font-semibold">Nguồn</h2>
          <Button variant="ghost" size="sm" render={<Link href={`/preview/${name}`} target="_blank" />}>
            Mở preview cách ly
            <ExternalLink data-icon="inline-end" />
          </Button>
        </div>
        <p className="text-caption1 text-muted-foreground">
          <code>{item.file}</code>
        </p>
        <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-4 text-caption1">
          <code>{src}</code>
        </pre>
      </section>
    </div>
  );
}
