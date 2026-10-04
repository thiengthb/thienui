import tokens from '@thienui/tokens/tokens.json';
import { checkContrast } from '@thienui/guards/contrast';
import { ContrastTable } from '@/components/token-views/contrast-table';
import { MotionLab } from '@/components/token-views/motion-lab';
import { Section, Swatch, Row } from '@/components/token-views/primitives';

export const metadata = { title: 'Token' };

type Tokens = typeof tokens & {
  primitive: Record<string, string | number>;
  themes: Record<string, Record<'light' | 'dark', Record<string, string>>>;
  meta: { name: string; label: string; default: boolean }[];
};
const T = tokens as unknown as Tokens;

/** Gom path tầng 1 theo ramp: `color.warm.light.3` -> ramp `warm`, mode `light`, bậc `3`. */
function ramps() {
  const out: Record<string, Record<string, Record<string, string>>> = {};
  for (const [path, v] of Object.entries(T.primitive)) {
    if (!path.startsWith('color.')) continue;
    const [, ramp, mode, step] = path.split('.');
    if (!ramp || !mode || !step) continue;
    ((out[ramp] ??= {})[mode] ??= {})[step] = String(v);
  }
  return out;
}

const group = (prefix: string) =>
  Object.entries(T.primitive)
    .filter(([p]) => p.startsWith(prefix))
    .map(([p, v]) => [p.slice(prefix.length), String(v)] as const);

/* Nhóm token tầng 2 theo VAI TRÒ, không theo thứ tự chữ cái — đọc theo vai trò mới thấy được
 * cấu trúc: mặt nào nổi trên mặt nào, chữ nào đi với mặt nào. */
const SEMANTIC_GROUPS: { title: string; note: string; keys: string[] }[] = [
  {
    title: 'Mặt & chữ',
    note: 'Bậc độ sâu: sidebar chìm dưới trang, card nổi trên trang, popover trên cùng.',
    keys: ['sidebar', 'background', 'card', 'popover', 'foreground', 'muted-foreground'],
  },
  {
    title: 'Hành động',
    note: 'primary giữ ĐÚNG mã thương hiệu; nhãn là ink thay vì trắng để vượt sàn 4.5:1.',
    keys: ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'destructive', 'destructive-foreground'],
  },
  {
    title: 'Trạng thái & viền',
    note: 'input là viền CỦA MỘT CONTROL nên chịu sàn 3:1; border là trang trí nên không.',
    keys: ['accent', 'accent-foreground', 'muted', 'border', 'input', 'ring'],
  },
  {
    title: 'Tín hiệu',
    note: 'Bốn token cùng họ L/C nên chúng đọc ra như một bộ. accent-brand là LINK, nên nó là chữ.',
    keys: ['accent-brand', 'ok', 'warn', 'alert', 'info'],
  },
  {
    title: 'Biểu đồ',
    note: 'Trong biểu đồ MÀU LÀ DỮ LIỆU, nên mọi chuỗi dùng bậc `text` và chịu sàn 3:1.',
    keys: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
  },
];

export default function TokensPage() {
  const R = ramps();
  const report = checkContrast(T);
  const def = T.meta.find((m) => m.default)?.name ?? T.meta[0]!.name;

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-3">
        <h1 className="text-title1 font-semibold tracking-tight">Token</h1>
        <p className="max-w-prose text-muted-foreground">
          Ba tầng, một chiều: <strong className="text-foreground">primitive</strong> giữ giá trị thô,{' '}
          <strong className="text-foreground">semantic</strong> chỉ trỏ tới primitive, và{' '}
          <strong className="text-foreground">component</strong> chỉ trỏ tới semantic. Component không bao giờ
          đọc primitive — build sẽ dừng nếu có.
        </p>
        <p className="max-w-prose text-subhead text-muted-foreground">
          Mọi thứ trên trang này đổi theo bộ chuyển <em>theme</em> và <em>sáng/tối</em> ở góc trên phải. Đó không
          phải hiệu ứng trình diễn: trang chỉ dùng token, nên nó đổi vì theme đổi.
        </p>
      </header>

      <Section
        title="Tầng 1 · Primitive"
        note="Thang 12 bậc cho neutral, mỗi mode một scale riêng, và BẬC SỐ MANG CÙNG MỘT NGHĨA ở cả hai. Cộng ba bậc tên riêng — sunken, surface, overlay — vì một thang số không diễn tả được 'mặt chìm dưới trang'."
      >
        <div className="flex flex-col gap-7">
          {Object.entries(R).map(([name, modes]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <code className="text-footnote font-medium">{name}</code>
                <span className="text-caption1 text-muted-foreground">
                  {Object.keys(modes.light ?? {}).length} bậc × 2 mode
                </span>
              </div>
              {(['light', 'dark'] as const).map((mode) => (
                <div key={mode} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-caption1 text-muted-foreground">{mode}</span>
                  <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-1">
                    {Object.entries(modes[mode] ?? {}).map(([step, value]) => (
                      <Swatch key={step} label={step} value={value} token={`--p-${name}-${step}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Tầng 2 · Semantic"
        note="Tên do shadcn quy định — đó là ràng buộc cứng của kiến trúc, để component shadcn nguyên bản chạy không cần sửa một dòng. Ô màu dưới đây đọc token LIVE, nên nó theo đúng theme bạn đang chọn."
      >
        <div className="grid gap-5 @3xl:grid-cols-2">
          {SEMANTIC_GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-2 rounded-lg border bg-card p-4">
              <h3 className="text-subhead font-semibold">{g.title}</h3>
              <p className="text-caption1 text-muted-foreground">{g.note}</p>
              <dl className="mt-1 flex flex-col divide-y">
                {g.keys.map((k) => (
                  <Row key={k} token={k} resolved={T.themes[def]?.light?.[k]} />
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Cổng tương phản"
        note="Bảng này KHÔNG phải ảnh chụp — nó là chính kết quả của @thienui/guards, chạy lúc build. Ba bậc: chữ 4.5:1 (WCAG 1.4.3) · đồ hoạ 3:1 (1.4.11) · decor không sàn, vì 1.4.11 miễn trừ phần trang trí. Bậc decor vẫn ĐƯỢC ĐO."
      >
        <ContrastTable results={report.results} defaultTheme={def} />
      </Section>

      <Section
        title="Chữ"
        note="Thang Dynamic Type của Apple. Body 17pt là SÀN dễ đọc cho khoảng cách đọc một sải tay — web mặc định 16px nằm dưới sàn đó, và chỉ riêng việc nâng lên đã làm giao diện đọc ra bình tĩnh hơn."
      >
        <div className="flex flex-col divide-y">
          {group('type.').map(([name, value]) => (
            <div key={name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <code className="w-28 shrink-0 text-caption1 text-muted-foreground">text-{name}</code>
              <code className="w-20 shrink-0 text-caption1 tabular-nums text-muted-foreground">{value}</code>
              <span style={{ fontSize: value }} className="min-w-0 truncate">
                Hệ thiết kế đo một lần
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Khoảng cách" note="Lưới 8pt, chia nhỏ 4pt — khớp đúng thang Tailwind nên không phải đổi gì ở chỗ dùng.">
        <div className="flex flex-col gap-1.5">
          {group('space.').map(([name, value]) => (
            <div key={name} className="flex items-center gap-3">
              <code className="w-10 shrink-0 text-caption1 text-muted-foreground">{name}</code>
              <code className="w-20 shrink-0 text-caption1 tabular-nums text-muted-foreground">{value}</code>
              <div style={{ width: value }} className="h-3 rounded-sm bg-primary" />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Bán kính & đồng tâm"
        note="r_trong = r_ngoài − padding. Đây là chi tiết Apple có đòn bẩy cao nhất trên web và gần như không ai làm: hai góc cùng bán kính lồng nhau làm góc trong nhìn như bị bóp, vì mắt thấy hai đường cong không song song."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {group('radius.').map(([name, value]) => (
              <div key={name} className="flex flex-col items-center gap-1.5">
                <div
                  style={{ borderRadius: value }}
                  className="size-16 border-2 border-primary bg-brand-wash"
                />
                <code className="text-caption1 text-muted-foreground">{name}</code>
              </div>
            ))}
          </div>

          <div className="grid gap-4 @2xl:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-footnote font-medium text-ok">Đúng — đồng tâm</span>
              {/* --pad khai ở hộp NGOÀI; hộp trong đọc --radius-concentric. Công thức ở token, không ở đây. */}
              <div className="rounded-xl border bg-card p-3 [--pad:--spacing(3)] [--radius-outer:var(--p-radius-xl)]">
                <div className="rounded-(--radius-concentric) bg-muted p-4 text-footnote text-muted-foreground">
                  Góc trong = góc ngoài − padding. Hai đường cong song song.
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-footnote font-medium text-alert">Sai — lặp cùng một bán kính</span>
              <div className="rounded-xl border bg-card p-3">
                <div className="rounded-xl bg-muted p-4 text-footnote text-muted-foreground">
                  Góc trong nhìn như bị bóp. Đây là thứ làm card lồng card trông rẻ.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Độ sâu"
        note="Bậc màu NỀN vẫn là tầng chính diễn tả độ sâu (nó đổi theo theme đúng cách); bóng chỉ là tầng phụ. Alpha ở dark mode đậm hơn, vì bóng trên nền tối cần nhiều hơn mới thấy."
      >
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{ boxShadow: `var(--shadow-${n})` }}
              className="flex size-28 flex-col items-center justify-center gap-1 rounded-lg border bg-card"
            >
              <code className="text-caption1 text-muted-foreground">shadow-{n}</code>
              <span className="text-caption2 text-muted-foreground">
                {['hairline', 'card', 'popover', 'modal'][n - 1]}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Chuyển động"
        note="Vào và ra KHÔNG đối xứng: vào chậm hơn để mắt bắt được, ra nhanh hơn để không chắn đường. Spring đúng cho thao tác do NGƯỜI khởi phát; easing đúng cho thứ do HỆ THỐNG khởi phát."
      >
        <MotionLab
          durations={group('motion.duration.')}
          easings={group('motion.easing.')}
        />
      </Section>
    </div>
  );
}
