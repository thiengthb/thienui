# AGENTS.md — thienui

Hệ thiết kế trung tâm. Đọc `README.md` trước để hiểu kiến trúc; file này là luật làm việc.

## Lệnh

```bash
pnpm verify      # CỔNG DUY NHẤT: token -> guards -> typecheck -> lint -> test -> build
pnpm tokens      # sinh lại dist/ của @thienui/tokens
pnpm guards      # ba cổng UI (thêm -- --report để xem bảng đo)
pnpm dev         # trang docs, cổng 4321
```

`pnpm verify` phải xanh trước khi nói là xong. Không mark pass khi chưa chạy.

## Gotchas — đọc trước khi sửa

- **`packages/tokens/dist/` là file SINH TỰ ĐỘNG.** Sửa `src/*.json` rồi `pnpm tokens`. Sửa `dist/`
  là mất công, nó bị ghi lại ở lần build sau.
- **`apps/docs/registry.json` cũng sinh tự động** từ cây thư mục, bởi `scripts/build-registry.mjs`.
  Thêm component = thêm file vào `registry/<tầng>/`, không sửa JSON.
- **Tên token tầng 2 do shadcn quy định.** Đổi `--primary` thành gì khác là làm mọi component shadcn
  nguyên bản hỏng. Thêm tên mới thì được.
- **`turbopack.root` trong `next.config.ts` phải là GỐC REPO.** pnpm đặt package thật trong
  `<gốc>/node_modules/.pnpm/` rồi symlink vào app; Turbopack không biên dịch file ngoài root. Đặt
  root = thư mục app thì store rơi ra ngoài và lỗi hiện ra là "Could not find the Next.js package",
  nghe như thiếu cài.
- **pnpm 12 có chính sách `minimumReleaseAge`** chặn package vừa publish vài giờ. Đừng tắt chính sách —
  ghim version cũ hơn. `lucide-react` đang ghim chính xác `1.51.0` vì lý do này.
- **pnpm 12 dùng khoá `allowBuilds`** trong `pnpm-workspace.yaml`, không phải `onlyBuiltDependencies`.
- **`apps/docs/package.json` PHẢI có `packageManager`.** shadcn CLI dò package manager bằng lockfile;
  trong monorepo pnpm lockfile ở gốc repo nên nó không thấy, rơi về `npm`, rồi vỡ ở `workspace:*` với
  `EUNSUPPORTEDPROTOCOL`. Khai tường minh là xong.
- **`registry/base/**` là RANH GIỚI VENDOR.** `shadcn add` ghi đè nó. 7 luật văn phong đã `exclude`
  khỏi đây; luật màu thì vẫn áp. Patch có chủ ý phải ghi vào `docs/vendor-patches.md`.
- **Địa chỉ registry công khai sống ở `apps/docs/registry.config.mjs`**, một chỗ duy nhất. Chưa deploy —
  đổi `PUBLIC_URL` hoặc đặt `THIENUI_REGISTRY_URL`.

## Trang showcase (apps/docs)

- `pnpm dev` -> :4321. `pnpm shots` chụp 4 tổ hợp theme × mode (cần server đang chạy).
- **Hai trục theme phải cùng nằm trên `<html>`**: `class="dark"` (next-themes) và `data-theme`
  (`BrandThemeProvider`). Đặt `data-theme` trên một div bên trong thì `[data-theme='x'].dark` không
  bao giờ khớp, và theme tối của brand phụ im lặng không áp.
- **Đừng dùng mẫu `useState(false)` + `useEffect(() => setMounted(true))`.** Dùng `useMounted()` trong
  `lib/use-mounted.ts` (`useSyncExternalStore`). Mẫu cũ gọi setState đồng bộ trong effect — luật
  `react-hooks/set-state-in-effect` bắt nó, và nó thêm một render lồng cho mỗi component dùng.
- Demo khai trong `registry/demos/index.tsx`, giữ THAM CHIẾU tới component chứ không giữ tên —
  đường dẫn động không resolve được qua Turbopack. Component compound (Dialog, Combobox, Calendar,
  Progress) không khai được bằng spec `variants × sizes`; chúng cần render riêng.
- `hover` / `active` / `focus-visible` KHÔNG force được từ JS. Ma trận ghi rõ điều đó thay vì hiện
  một ô trông như đã kiểm. Đó là việc của `pnpm shots`.

## Khi viết UI

1. **Hook sẽ hiện 36 luật** trước lần ghi `.tsx`/`.css` đầu tiên của phiên. Đọc nó.
2. **Màu, khoảng cách, bán kính, cỡ chữ, thời lượng, easing đều lấy từ token.** Giá trị tuỳ ý chỉ
   được phép khi nó *trỏ token*: `rounded-[min(var(--radius-md),12px)]` được, `text-[0.8rem]` không.
3. **Primitive (`@base-ui/react`) chỉ được import trong `registry/base/**`.** Luật
   `primitives-only-in-base` cưỡng chế. Đây là thứ làm lần đổi primitive thứ ba thành một chi phí
   đã biết — shadcn đã đổi mặc định Radix → Base UI trong 07/2026, và Base UI vừa đổi tên package.
4. **Sáu vi-trạng thái** cho mọi phần tử tương tác: default · hover · focus-visible · active · disabled
   · loading. **Sáu trạng thái dữ liệu** cho mọi bề mặt: rỗng · đang tải · lỗi · chữ dài tràn · số 0 ·
   số rất lớn.
5. **Container query, không viewport breakpoint**, cho mọi thứ trong `registry/`. Component dùng lại
   được phải phản ứng theo hộp chứa nó.

## Khi người dùng sửa một mẫu UI

Khoá nó **ngay lần đầu**, đừng đợi lần thứ hai: skill `/ui-pattern-lock`. Quy trình đầy đủ nằm trong
`.claude/skills/ui-pattern-lock/SKILL.md`.

Luôn thử biến luật thành `check` máy chạy được trước khi hạ xuống `manual`. `sakubun` có 13/21 luật
manual và đó là chỗ các luật âm thầm bị bỏ. Ở đây tỉ lệ là 18 máy / 18 người — mỗi lần một luật manual
bị phạm là một lần nên thử lại xem có cách nào cưỡng chế được.

## Khi vay component từ registry ngoài

Năm bước trong `README.md`, không bỏ bước nào. Luật `no-quarantine-imports` sẽ làm đỏ nếu bỏ.

Điều cần nhớ: registry **chèn code vào repo và bạn sở hữu nó ngay**. Không có gì "chỉ là dependency" ở
đây — mọi dòng vay về là dòng bạn phải bảo trì và phải qua được cổng.

## Tầng patterns & shells

- `patterns/` là code TA VIẾT — mọi luật áp đủ, không có `exclude` nào. Khác hẳn `base/`.
- **Đừng chép class giữa `PageShell` và `PageSkeleton`.** Phần chung nằm ở `shells/page-chrome.ts` và
  cả hai IMPORT nó. Ở sakubun hai file chép nhau rồi lệch: placeholder thanh trên di động bị thiếu,
  nên dưới `md` breadcrumb nhảy ~41px mỗi lần điều hướng. Chép thì lệch được; import thì không.
- `data-table` dùng `@tanstack/react-table@^9`. **Feature phải đăng ký tường minh** trong
  `tableFeatures({...})` — v8 gói sẵn mọi thứ, v9 chỉ mở API khi feature có mặt. Thêm một API mới
  (ẩn cột, lọc, phân trang) nghĩa là thêm feature tương ứng, không phải chỉ gọi hàm.
  Dùng alias `Column<T>` mà file đó xuất ra, đừng dùng `ColumnDef` thô: v9 đưa bộ feature vào generic
  của `ColumnDef`, nên một cột khai với bộ feature khác sẽ không gán được.
- **Mẫu "latest ref" chỉ đúng khi phần ghi nằm trong effect.** Gán `ref.current = x` thẳng trong thân
  component là side effect trong pha render; React có thể render lại mà không commit, và ref sẽ mang
  giá trị của một lần render bị vứt đi. Luật `react-hooks` bắt được điều này.
- Tầng cảm giác ở `registry/lib/motion.ts`. KHÔNG dùng `Pressable` cho item trong composite của
  Base UI (Toolbar, ToggleGroup, Tabs, Menubar) — chúng đăng ký qua ref và một lớp bọc phá đăng ký;
  ở đó gọi thẳng `usePressDepth` trong prop `render`.
- Component có HÀNH VI thật (bảng, dialog, chồng thẻ) dùng `custom` trong `registry/demos/index.tsx`
  + một file `*-demo.tsx` riêng. Spec `variants × sizes` không diễn tả được chúng.

## Khi sửa một cổng

Cổng mà sửa cho nó im tiếng thì không còn là cổng:

- Cặp contrast trượt → **sửa token**. Dùng `solveLightness()` trong `@thienui/guards` để giải L thay
  vì mò. Không chuyển một cặp chữ xuống bậc đồ hoạ hay `decor`.
- Luật bắt oan code VENDOR trong `base/**` → thêm `check.exclude`, đừng sửa code vendor.
- Regex bắt oan code đang đúng → **hẹp regex lại**, đừng thêm `allow`. Một regex quá rộng còn tệ hơn
  không có luật: nó dạy người ta cách bỏ qua cổng.
- `allow` mới → lý do phải dài hơn 20 ký tự, có test cưỡng chế. "file sinh tự động" không đủ.
- Luật mới → `canonical` phải trỏ vào chỗ CÓ THẬT; cổng thứ tư kiểm điều đó. Dùng `"—"` nếu luật cố
  ý không có canonical (luật về thái độ, không về một file).
- Thêm cổng mới → kèm một test chứng minh nó **bắt được** vi phạm. Xem ca
  "bật một token sai thì cổng PHẢI đỏ" trong `packages/guards/test/guards.test.mjs`. Một cổng không có
  test chứng minh nó đỏ được là một cổng có thể đã mù từ đầu mà không ai biết.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
