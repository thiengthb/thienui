'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/registry/base/button';

/**
 * Khối lệnh cài, kèm nút copy.
 *
 * `navigator.clipboard` CẦN secure context (https hoặc localhost) và có thể bị từ chối quyền — nên
 * nó phải try/catch, và khi thất bại thì nói ra thay vì im lặng hiện dấu tích. Một nút copy báo thành
 * công mà không copy được là tệ hơn một nút không có phản hồi gì.
 */
export function CopyCommand({ name }: { name: string }) {
  const cmd = `pnpm dlx shadcn@latest add @thienui/${name}`;
  const [state, setState] = React.useState<'idle' | 'ok' | 'fail'>('idle');

  React.useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(t);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setState('ok');
    } catch {
      setState('fail');
    }
  }

  return (
    <div className="flex max-w-full items-center gap-2 rounded-lg border bg-muted/40 p-2 pl-3">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-caption1">{cmd}</code>
      <Button
        variant="ghost"
        size="sm"
        onClick={copy}
        aria-label={state === 'ok' ? 'Đã copy' : 'Copy lệnh cài'}
        className="shrink-0"
      >
        {state === 'ok' ? <Check className="text-ok" /> : <Copy />}
      </Button>
      {state === 'fail' ? (
        <span className="shrink-0 pr-1 text-caption2 text-alert">không copy được — chọn và copy tay</span>
      ) : null}
    </div>
  );
}
