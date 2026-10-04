'use client';

import * as React from 'react';
import { MotionConfig } from 'motion/react';
import { Button } from '@/registry/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/base/card';
import { ToggleGroup, ToggleGroupItem } from '@/registry/base/toggle-group';
import { Pressable } from '@/registry/patterns/pressable';
import { MotionPreferenceProvider, useReducedMotion, type MotionPreference } from '@/registry/lib/motion';
import { primitive } from '@thienui/tokens';

const ROLES = ['press', 'snappy', 'surface', 'bouncy'] as const;
const PERSONALITIES = ['seam', 'brisk', 'relaxed', 'playful'] as const;

/**
 * Tầng cảm giác, bấm được.
 *
 * Bảng số ở dưới đọc THẲNG từ token, nên nó không thể lệch với thứ `usePressDepth` thật sự dùng —
 * một bảng chép tay sẽ đúng đúng một lần.
 */
export function MotionDemo() {
  const [pref, setPref] = React.useState<MotionPreference>('system');

  return (
    <MotionPreferenceProvider preference={pref}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption1 text-muted-foreground">Chuyển động:</span>
          <ToggleGroup
            value={[pref]}
            onValueChange={(v) => v[0] && setPref(v[0] as MotionPreference)}
            aria-label="Tuỳ chọn chuyển động"
          >
            <ToggleGroupItem value="system" size="sm">theo hệ thống</ToggleGroupItem>
            <ToggleGroupItem value="full" size="sm">đầy đủ</ToggleGroupItem>
            <ToggleGroupItem value="reduce" size="sm">giảm</ToggleGroupItem>
          </ToggleGroup>
          <Readout />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Pressable>
            <Button>Bấm và giữ</Button>
          </Pressable>
          <Pressable>
            <Button variant="secondary">Thử bằng Space</Button>
          </Pressable>
          <Pressable disabled>
            <Button variant="secondary" disabled>
              Bị khoá — không lún
            </Button>
          </Pressable>
        </div>

        <p className="max-w-prose text-caption1 text-muted-foreground">
          Chọn <strong className="text-foreground">giảm</strong> rồi bấm lại: nút không lún nữa nhưng vẫn
          mờ đi một chút. Chính sách là <strong className="text-foreground">không bao giờ chết</strong> —
          đổi chuyển động thành opacity, để mọi tương tác vẫn có phản hồi. Một control không phản hồi gì
          khi bấm là một control hỏng, kể cả với người đã khai muốn ít chuyển động.
        </p>

        <SpringTable />
      </div>
    </MotionPreferenceProvider>
  );
}

function Readout() {
  const reduced = useReducedMotion();
  return (
    <span className="text-caption1 tabular-nums text-muted-foreground">
      đang giải thành: <strong className="text-foreground">{reduced ? 'giảm' : 'đầy đủ'}</strong>
    </span>
  );
}

/** Bảng spring, đọc thẳng từ token — bốn tính cách × bốn vai trò. */
function SpringTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-subhead">Bốn tính cách × bốn vai trò</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 max-w-prose text-caption1 text-muted-foreground">
          Đổi <code>PERSONALITY</code> trong <code>registry/lib/motion.ts</code> là cả hệ đổi cảm giác
          cùng nhau — không phải sửa file component nào. Bảng này đọc thẳng từ token nên nó không lệch
          được với thứ đang chạy.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-caption1">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="p-2 font-medium text-muted-foreground">tính cách</th>
                {ROLES.map((r) => (
                  <th key={r} className="p-2 font-medium text-muted-foreground">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERSONALITIES.map((p) => (
                <tr key={p} className="border-b last:border-0">
                  <td className="p-2 font-medium">
                    {p}
                    {p === 'seam' ? (
                      <span className="ml-1.5 text-caption2 text-accent-brand">đang dùng</span>
                    ) : null}
                  </td>
                  {ROLES.map((r) => {
                    const v = primitive[`motion.spring.${p}.${r}` as keyof typeof primitive] as unknown as {
                      stiffness: number;
                      damping: number;
                      mass: number;
                    };
                    return (
                      <td key={r} className="p-2 tabular-nums text-muted-foreground">
                        {v.stiffness} / {v.damping} / {v.mass}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-caption2 text-muted-foreground">stiffness / damping / mass</p>
      </CardContent>
    </Card>
  );
}

/** Chứng minh `MotionConfig reducedMotion="never"` CỐ Ý không được coi là ép chuyển động đầy đủ. */
export function MotionConfigNote() {
  return (
    <MotionConfig reducedMotion="never">
      <p className="text-caption1 text-muted-foreground">
        Bọc trong <code>{'<MotionConfig reducedMotion="never">'}</code>: <Readout /> — vẫn theo OS, không
        bị ép. Đó là giá trị <em>mặc định</em> trong context của motion nên nó có mặt cả khi không ai
        dựng provider; coi nó là một lần opt-out thật sẽ âm thầm bỏ qua cài đặt OS cho mọi consumer.
      </p>
    </MotionConfig>
  );
}
