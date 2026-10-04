# Vay component từ registry ngoài

418 registry công khai đang tồn tại. Data-table, chart, rich-text, kanban, AI chat đều có bản làm tốt
rồi — viết lại chúng là lãng phí. Nhưng registry **chèn code vào repo và bạn sở hữu nó ngay**: không
có gì "chỉ là dependency" ở đây, mọi dòng vay về là dòng bạn phải bảo trì và phải qua được cổng.

Luật `no-quarantine-imports` cưỡng chế quy trình này. Không có nó, `_quarantine` chỉ là một tên thư mục.

## Năm bước

### 1 — Hạ cánh vào khu cách ly

```bash
pnpm dlx shadcn@latest add @niko-table/data-grid --path registry/_quarantine/niko
```

**Không** vào `registry/base` hay `registry/patterns`. Không file nào trong `base/`, `patterns/`,
`shells/`, `blocks/` được import từ `_quarantine/` — cổng sẽ đỏ.

### 2 — Soát

| soát gì | vì sao |
|---|---|
| Màu cứng (hex, `rgb()`, class bảng màu Tailwind) | Không đổi theo theme, và vô hình với cổng contrast vì cổng chỉ đo token. |
| Thẻ svg tự vẽ | Lệch stroke width và thang cỡ của lucide; trông sai ở dark mode. |
| Thuộc tính `title=` | Không hiện trên cảm ứng, không nhận theme, trễ ~1s không chỉnh được. |
| Giá trị tuỳ ý cho spacing/radius/cỡ chữ | Một quyết định không được ghi ở đâu. |
| Thời lượng / easing viết tay | Chuyển động không cùng nhịp với phần còn lại. |
| `fetch` riêng, biến môi trường, telemetry | Thứ bạn không biết mình đang chạy. |
| License | Bạn đang phát hành lại code này qua registry của mình. |

### 3 — Tái-token-hoá

hex → token · radius tuỳ ý → `--radius-*` · duration thô → token motion · `title=` → `<Explain>` ·
`<input>` trần → `<Input>` dùng chung · breakpoint viewport → container query.

### 4 — Chạy cổng

```bash
pnpm guards && pnpm typecheck && pnpm lint
```

### 5 — Thăng cấp

Chuyển sang `registry/patterns/`, thêm demo vào `registry/demos/index.tsx`, chạy lại `pnpm verify`.

## Khi nào thì KHÔNG vay

- Thứ cần đúng **một** hành vi nhỏ. Vay 300 dòng để dùng 20 là mang về 280 dòng phải bảo trì.
- Thứ có sẵn ở tầng dưới. `EmptyState` dựng trên `Empty` của shadcn chứ không dựng lại — luật
  `reuse-before-build`.
- Thứ chạm vào token. Một bộ "theme" vay về sẽ tranh với ba tầng token, và nó sẽ thắng ở chỗ bạn
  không để ý.

## Nguồn đã lọc sức khoẻ

Khai sẵn trong `apps/docs/components.json`, đã đối chiếu chỉ mục registry trung tâm (còn sống,
`healthy`, sẵn sàng 30 ngày ≥ 0.98):

| namespace | dùng cho |
|---|---|
| `@niko-table` · `@data-table-filters` | bộ lọc faceted, data grid sửa tại chỗ, filter đồng bộ URL |
| `@seamui` | tầng cảm giác: press lún, spring, haptic, độ sâu |
| `@animate-ui` | primitive có animation sẵn |
| `@evilcharts` | biểu đồ trên Recharts |
| `@kibo-ui` | composite phức tạp: dropzone, kanban, gantt |
| `@ai-elements` | giao diện AI/chat (chính thức từ AI SDK) |

## Phân biệt với `registry/base/`

`base/` cũng là code vendor, nhưng nó đến từ **registry chính thức của shadcn** và được kéo lại bằng
`shadcn add` — lệnh đó **ghi đè file**. Nên `base/` không đi qua bước tái-token-hoá: sửa nó là sửa
một thứ sẽ bị xoá ở lần cập nhật sau. Bảy luật văn phong đã `exclude` khỏi `base/`; luật màu thì vẫn
áp, và 55 file vendor qua hết.

Chi tiết: `README.md` mục "registry/base/ là ranh giới vendor" và `docs/vendor-patches.md`.
