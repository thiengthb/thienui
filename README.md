# thienui

Hệ thiết kế trung tâm. Token, luật UI và component được **đo một lần** rồi phát cho mọi project sau.

Trích từ [`sakubun`](https://github.com/thiengthb/sakubun), đặt trên shadcn registry, siết bằng test chứ không bằng lời nhắc.

```bash
pnpm install
pnpm verify      # token -> guards -> typecheck -> lint -> test -> build
pnpm dev         # trang docs ở http://localhost:4321
```

---

## Ý tưởng cốt lõi: chia theo trục "được phép lệch"

Hai đường phát hành, và việc gì đi đường nào không phải chuyện tiện tay:

| | đường | vì sao |
|---|---|---|
| **Component** | shadcn registry (`@thienui/*`) | Mỗi project **sở hữu** code và **được quyền lệch**. Một component bạn không sửa được thì sẽ bị bọc lại, và cái wrapper đó là nơi hệ thiết kế đi chết. |
| **Quản trị** | package npm (`@thienui/tokens`, `@thienui/guards`) | Token và cổng **bắt buộc** đồng nhất, và phải nâng được bằng một lệnh. Cho phép lệch ở đây là cho phép hai project có hai định nghĩa "màu lỗi". |

## Cấu trúc

```
apps/docs/                 Next 16 · trang showcase + registry host
├─ app/(site)/             /  ·  /tokens  ·  /components  ·  /components/[name]
├─ app/preview/[name]/     render CÁCH LY — không chrome, để iframe và để chụp ảnh
├─ components/             chrome của site, bộ chuyển theme, ma trận demo
├─ registry/
│  ├─ base/                55 primitive trên Base UI + hook — RANH GIỚI VENDOR
│  ├─ patterns/            generic đã ghép: data-table, confirm-dialog, empty-state
│  ├─ shells/              khung app & layout
│  ├─ blocks/              cả màn hình
│  ├─ demos/               spec demo (variants × sizes), khai bằng dữ liệu
│  └─ _quarantine/         code vay, chưa soát — KHÔNG AI được import
├─ registry.config.mjs     địa chỉ công khai của registry — MỘT chỗ duy nhất
├─ registry.json           SINH TỰ ĐỘNG từ cây thư mục, đừng sửa tay
└─ public/r/*.json         registry công khai (`shadcn build`)

packages/
├─ tokens/                 @thienui/tokens — DTCG ba tầng -> CSS + TS + JSON
├─ guards/                 @thienui/guards — cổng contrast, gamut, pattern-lock
├─ ui-patterns/            @thienui/ui-patterns — 32 luật UI đã khoá
└─ tsconfig/

tooling/shots.mjs          chụp 4 tổ hợp theme × mode bằng Playwright
```

## Token: ba tầng, một chiều

```
primitive  --p-clay-solid: oklch(0.672 0.131 39)
   ↓
semantic   --primary: var(--p-clay-solid)              ← tên do shadcn quy định
   ↓
component  --btn-primary-bg: var(--primary)
```

Luật **không có ngoại lệ**: component không bao giờ đọc primitive. Build sẽ dừng nếu một token tầng 2 giữ literal thay vì trỏ tầng 1.

**Ràng buộc cứng:** tên tầng 2 phải trùng chính xác tên shadcn (`--background`, `--primary`, `--muted-foreground`…) để component shadcn nguyên bản chạy không cần sửa. Thêm tên mới thì được; đổi tên có sẵn thì không.

Sửa token = sửa `packages/tokens/src/*.json` rồi `pnpm tokens`. **Đừng sửa `dist/`** — nó bị ghi lại mỗi lần build.

### Hai theme, và vì sao phải là hai

`claude` (Claude Clay, mặc định) và `slate` (Slate Teal). Theme thứ hai **được sinh ra từ theme thứ nhất bằng phép thay ramp** — `warm`→`cool`, `clay`→`teal` — không một dòng nào sửa tay. Đó là bài kiểm tra cho tầng primitive: nếu phải sửa tay một dòng thì ở đó token tầng 2 đang giữ một quyết định vốn phải thuộc tầng 1. Chỉ có một theme thì tầng primitive sẽ thoái hoá về đúng cái hệ một-tầng mà `sakubun` đang có.

## Ba cổng

```bash
pnpm guards              # chạy cả ba
pnpm guards -- --report  # kèm bảng đo đầy đủ
```

**1 · Contrast** — 296 cặp, mọi theme × mọi mode. Ba bậc: chữ 4.5:1 (WCAG 1.4.3) · đồ hoạ 3:1 (1.4.11) · `decor` không sàn (1.4.11 miễn trừ phần trang trí) nhưng vẫn **được đo và báo cáo**.

Khác hai điểm so với bản trong `sakubun`, và cả hai là sửa lỗi thật:

- **Đọc dữ liệu, không parse CSS.** Bản cũ đọc `globals.css` theo từng dòng, nên một lần `prettier --write` gấp một dòng token thành ba đã làm 4 ca đỏ với `TypeError`, và sinh ra chú thích "GIỮ TRÊN MỘT DÒNG" trong file CSS. Cổng nào mà format code làm vỡ được thì không phải cổng.
- **Ma trận, không phải danh sách cặp.** Bản cũ chỉ kiểm cặp khai tay, nên một badge `--warn` trên `--card` không ai kiểm trong khi test tưởng đã phủ. Bản này khai *chính sách ghép* rồi tự sinh tổ hợp.

**2 · Gamut** — token khai màu ngoài sRGB sẽ bị browser gamut-map, nên màu hiện ra khác màu đã khai, và tỉ số contrast đo được không phải tỉ số người dùng thấy. Mọi token đã clamp về trong gamut (lùi 2% khỏi biên).

**3 · Pattern lock** — 32 luật, **14 máy kiểm** + 18 người review. Mỗi luật có `rule` · `why` · `canonical` · `check` · `allow`.

Hook `.claude/hooks/ui-pattern-lock.mjs` hiện toàn bộ luật trước **lần ghi UI đầu tiên của mỗi phiên** — luật đến vào lúc nó còn thay đổi được quyết định, không phải lúc test đã đỏ.

Người dùng sửa một mẫu UI? Khoá nó **ngay**, đừng đợi lần thứ hai: skill `/ui-pattern-lock`.

## Project sau tiêu thụ thế nào

```bash
# 1 — dựng với preset Base UI của shadcn
pnpm dlx shadcn@latest init -t next -b base -p nova

# 2 — tầng quản trị: bắt buộc đồng nhất
pnpm add -D @thienui/guards @thienui/tokens @thienui/ui-patterns

# 3 — component: code được sao vào repo, bạn sở hữu và được quyền sửa
pnpm dlx shadcn@latest add @thienui/theme-claude @thienui/sidebar
#     -> kéo theo button · input · separator · sheet · skeleton · tooltip + hook,
#        vì registryDependencies được SUY từ import của chính file

# 4 — nối cổng vào verify
#     package.json → "verify": "... && thienui-guards"
```

## Trang showcase

```bash
pnpm dev     # http://localhost:4321
pnpm shots   # chụp 4 tổ hợp theme × mode (cần server đang chạy)
```

| trang | nó chứng minh điều gì |
|---|---|
| `/tokens` | Ramp tầng 1, token tầng 2 theo vai trò, thang chữ / khoảng cách / bán kính / độ sâu / chuyển động. Và **bảng đo contrast thật** — không phải ảnh chụp, mà là chính kết quả `@thienui/guards` chạy lúc build, lọc theo theme đang chọn. |
| `/components` | 58 item, bốn tầng. Cái nào **chưa có demo** thì hiện rõ là chưa — nợ nhìn thấy được thì còn trả được. |
| `/components/[name]` | Lệnh cài · export · ma trận **biến thể × kích cỡ** · **sáu vi-trạng thái** · **sáu trạng thái dữ liệu** · nguồn. |
| `/preview/[name]` | Render cách ly, không CSS nào của site xung quanh. Nếu một component chỉ trông đúng trong trang docs thì nó đang mượn style từ trang docs. |

**Hai trục theme**, cả hai ghi lên `<html>`: `class="dark"` (mode, do next-themes) và `data-theme`
(brand, do `BrandThemeProvider`). Phải cùng một phần tử — token brand khai ở `[data-theme='x'].dark`.

### Không dùng Fumadocs — và vì sao

Kế hoạch ban đầu nói Fumadocs. Khi dựng thì nó không còn hợp: Fumadocs mạnh ở **docs văn xuôi MDX**
và nó **sở hữu layout**, trong khi thứ cần dựng là một showcase có bộ chuyển theme riêng, ma trận
trạng thái và bảng đo chạy lúc build. Hai thứ đó tranh nhau cái layout. Showcase dựng thẳng bằng
route Next thì ít lớp hơn và không có gì phải chống lại.

Fumadocs vẫn đáng thêm **sau**, cho phần docs văn xuôi — nó không mâu thuẫn với các route hiện có.

### Playwright thay Storybook — lý do thật

Không phải để tiết kiệm. Một trang web **không tự hover được cho chính nó**: `hover`, `active` và
`focus-visible` là pseudo-class CSS, nên ma trận vi-trạng thái phải ghi "tự trỏ vào để xem" cho ba ô
đó. `tooling/shots.mjs` thì hover được thật, Tab được thật, và nó **đọc lại `data-theme` + `.dark`
sau khi tải** để chứng minh theme đã áp — nếu brand provider vỡ thì ảnh vẫn trông "đúng", vì theme
mặc định cũng là `claude`.

## `registry/base/` là ranh giới vendor

`base/` chứa code kéo từ registry shadcn, và `shadcn add` **ghi đè file**. Trong lúc port 55 primitive,
bản sửa `text-[0.8rem]` → `text-footnote` ở `button.tsx` bị chính lệnh đó xoá sau hai lô. Một cổng mà
fix của nó bị một lệnh thường ngày hoàn tác là một cổng sẽ bị bỏ qua.

Nên phạm vi luật được chia theo *ai viết code*, không theo *luật nào nghe nghiêm hơn*:

| | áp ở đâu | vì sao |
|---|---|---|
| **Luật màu** (`no-hardcoded-colors`, `no-tailwind-palette-colors`) | **khắp nơi, kể cả `base/`** | Màu quyết định theme có chạy không. 55 file vendor qua hết — shadcn token-hoá màu đúng chuẩn. |
| **Luật văn phong** (7 luật: giá trị tuỳ ý, duration thô, vị trí glass, focus-visible, `title=`, `<input>` trần, svg tay) | **trừ `base/`** (`check.exclude`) | Sửa code vendor để thoả văn phong là làm việc sẽ bị xoá ở lần cập nhật sau — và xoá âm thầm, vì test vẫn xanh. |

Mọi file vendor hạ cánh trong **đúng một thư mục**: `components.json` trỏ cả `ui`, `lib` và `hooks` vào
`@/registry/base`. Ranh giới vendor là một thư mục, hoặc nó không phải ranh giới. (`use-mobile.ts` ban
đầu nằm ở `hooks/` và đó là chỗ duy nhất lint còn đỏ — vì nó là vendor nằm ngoài ranh giới.)

Patch có chủ ý lên vendor phải ghi vào `docs/vendor-patches.md`, cùng mục "đã cân nhắc và cố ý không
patch". Luật `base-is-vendor` giữ hợp đồng này.

## Vay component từ ngoài — năm bước, không bỏ bước

418 registry công khai đang tồn tại; data-table, chart, rich-text, kanban, AI chat đều có bản làm tốt rồi. Nhưng registry **chèn code vào repo và bạn sở hữu nó ngay** — gồm cả màu cứng, `<svg>` tự vẽ, `title=`, spacing tuỳ ý. Đúng những thứ 32 luật này cấm.

```bash
# 1 — hạ cánh vào khu cách ly, KHÔNG vào registry/base
pnpm dlx shadcn@latest add @niko-table/data-grid --path registry/_quarantine/niko

# 2 — soát: màu cứng? svg tay? title=? spacing tuỳ ý? fetch riêng? license?
# 3 — tái-token-hoá: hex -> token · radius tuỳ ý -> --radius-* · duration thô -> motion token
# 4 — chạy cổng
pnpm guards && pnpm typecheck && pnpm lint

# 5 — thăng cấp sang registry/patterns/, thêm trang preview
```

Luật `no-quarantine-imports` cưỡng chế bước này: không file nào trong `base/`, `patterns/`, `shells/`, `blocks/` được import từ `_quarantine/`. Không có luật đó thì `_quarantine` chỉ là một cái tên thư mục.

Các namespace đã khai sẵn trong `components.json` (đã lọc sức khoẻ qua chỉ mục registry trung tâm): `@seamui` · `@kibo-ui` · `@niko-table` · `@evilcharts` · `@animate-ui` · `@ai-elements`.

## Đã làm / còn nợ

| | trạng thái |
|---|---|
| Token ba tầng, hai theme, 4 mode | ✅ `pnpm tokens` |
| Cổng contrast + gamut + pattern lock | ✅ `pnpm guards`, 28 test |
| Hook + skill `/ui-pattern-lock` | ✅ |
| Monorepo + registry sinh tự động + `shadcn build` | ✅ `pnpm verify` |
| Tầng base: **55 primitive + 1 hook** trên Base UI 1.8.0 | ✅ pha 2 |
| Trang showcase: token · gallery · ma trận 6×6 · preview cách ly | ✅ pha 3 |
| Chụp ảnh 4 tổ hợp theme × mode (`pnpm shots`) | ✅ |
| Demo: 12/58 item — component compound cần render riêng | ⬜ nợ đã biết |
| Deploy registry (URL ở `registry.config.mjs`) | ⬜ chưa chọn domain |
| Fumadocs cho docs văn xuôi | ⬜ pha 3b |
| Registry **công khai**, cài được từ project ngoài | ✅ đã kiểm end-to-end |
| Thu hoạch `patterns/` + `shells/` từ sakubun | ⬜ pha 4 |
| Tầng cảm giác từ `@seamui` -> motion token | ⬜ pha 5 |
| Dựng một project thật hoàn toàn trên thienui | ⬜ pha 6 |
