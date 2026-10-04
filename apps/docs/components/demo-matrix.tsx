'use client';

import * as React from 'react';
import { DEMOS, MICROSTATES, DATA_STATES } from '@/registry/demos';

/**
 * Ma trận demo cho một component.
 *
 * `disabled` và `loading` force được qua prop. `hover`, `active` và `focus-visible` thì KHÔNG: chúng
 * là pseudo-class CSS, không có cách nào bật từ JS, và `focus-visible` còn chỉ xuất hiện khi điều
 * hướng bằng bàn phím — autofocus để demo sẽ cướp focus của người đang đọc trang.
 *
 * Nên ba ô đó hiện trạng thái nghỉ kèm nhãn nói rõ phải tự trỏ vào hoặc Tab vào. Thà nói ra giới hạn
 * còn hơn hiện một ô trông như đã được kiểm. Và đây đúng là chỗ Playwright giá trị hơn một trang
 * demo: nó hover được THẬT rồi chụp ảnh so sánh — một trang web không tự làm được điều đó cho mình.
 */
export function DemoMatrix({ name }: { name: string }) {
  const spec = DEMOS[name];
  if (!spec) return null;
  const C = spec.component;
  const base = { ...(spec.props ?? {}) };
  const kids = spec.children ? { children: spec.children } : {};

  const variants = spec.variants?.values ?? [null];
  const sizes = spec.sizes?.values ?? [null];

  return (
    <div className="flex flex-col gap-10">
      {spec.note ? (
        <p className="max-w-prose rounded-lg border-l-2 border-accent-brand bg-brand-wash px-4 py-3 text-footnote">
          {spec.note}
        </p>
      ) : null}

      {/* ── biến thể × kích cỡ ── */}
      <section className="@container flex flex-col gap-3">
        <Head title="Biến thể × kích cỡ" note="Mọi tổ hợp, cùng một lúc — chỗ duy nhất thấy được một biến thể lệch khỏi bộ." />
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-2.5 text-left text-caption1 font-medium text-muted-foreground">
                  {spec.variants?.prop ?? '—'}
                </th>
                {sizes.map((s) => (
                  <th key={String(s)} className="p-2.5 text-left text-caption1 font-medium text-muted-foreground">
                    {s ?? 'default'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={String(v)} className="border-b last:border-0">
                  <td className="p-2.5 align-middle">
                    <code className="text-caption1 text-muted-foreground">{v ?? 'default'}</code>
                  </td>
                  {sizes.map((s) => (
                    <td key={String(s)} className="p-2.5 align-middle">
                      <C
                        {...base}
                        {...kids}
                        {...(spec.variants && v ? { [spec.variants.prop]: v } : {})}
                        {...(spec.sizes && s ? { [spec.sizes.prop]: s } : {})}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── sáu vi-trạng thái ── */}
      {spec.microstates ? (
        <section className="@container flex flex-col gap-3">
          <Head
            title="Sáu vi-trạng thái"
            note="Thiếu một là chỗ giao diện đọc ra 'chưa xong'. active/pressed và loading là hai cái hay thiếu nhất — và đúng là hai cái người dùng cần nhất."
          />
          <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-3">
            {MICROSTATES.map((st) => {
              const forced =
                st.name === 'disabled'
                  ? { disabled: true }
                  : st.name === 'loading'
                    ? { disabled: true, 'aria-busy': true }
                    : {};
              // focus-visible cũng là pseudo-class, và nó còn khó hơn: nó CHỈ xuất hiện khi điều
              // hướng bằng bàn phím. Tự ý autofocus để demo sẽ cướp focus của người đang đọc trang.
              const cssOnly = st.name === 'hover' || st.name === 'active' || st.name === 'focus-visible';
              return (
                <div key={st.name} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <code className="text-caption1 font-medium">{st.name}</code>
                    {cssOnly ? (
                      <span className="text-caption2 text-warn">
                        {st.name === 'focus-visible' ? 'Tab vào để xem' : 'tự trỏ vào để xem'}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-h-12 items-center">
                    <C {...base} {...kids} {...forced} />
                  </div>
                  <p className="text-caption2 text-muted-foreground">{st.note}</p>
                </div>
              );
            })}
          </div>
          <p className="max-w-prose text-caption1 text-muted-foreground">
            <code>hover</code>, <code>active</code> và <code>focus-visible</code> là pseudo-class CSS — không
            force được từ JS, nên ba ô đó hiện trạng thái nghỉ. Nói ra giới hạn thì tốt hơn hiện một ô trông như
            đã kiểm. (Đây là chỗ Playwright có giá trị hơn một trang demo: nó <em>hover được thật</em> rồi chụp
            ảnh so sánh.)
          </p>
        </section>
      ) : null}

      {/* ── sáu trạng thái dữ liệu ── */}
      <section className="@container flex flex-col gap-3">
        <Head
          title="Sáu trạng thái dữ liệu"
          note="Quality floor, không phải điểm cộng. Năm trong sáu cái này không xuất hiện khi dev chạy với dữ liệu mẫu, nên chúng được phát hiện bởi người dùng chứ không bởi ta."
        />
        <ul className="grid gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
          {DATA_STATES.map((s) => (
            <li key={s.name} className="rounded-lg border border-dashed p-3">
              <div className="text-caption1 font-medium">{s.name}</div>
              <p className="mt-0.5 text-caption2 text-muted-foreground">{s.note}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-prose text-caption1 text-muted-foreground">
          Sáu ô trên là <strong className="text-foreground">bảng chấm</strong>, chưa phải demo. Chúng chỉ demo
          được ở tầng <code>patterns/</code> — nơi có component nhận dữ liệu thật (data-table, empty-state). Đó
          là pha 4.
        </p>
      </section>
    </div>
  );
}

function Head({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-2">
      <h2 className="text-subhead font-semibold">{title}</h2>
      <p className="max-w-prose text-caption1 text-muted-foreground">{note}</p>
    </div>
  );
}
