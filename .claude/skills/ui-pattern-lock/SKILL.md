---
name: ui-pattern-lock
description: Khoá một mẫu UI thành luật máy cưỡng chế sau khi người dùng sửa một lỗi giao diện. Dùng NGAY khi người dùng chỉnh một mẫu UI — đừng đợi nó lặp lại lần thứ hai.
---

# Khoá một mẫu UI

Người dùng vừa sửa một mẫu UI. Việc của bạn là làm sao họ không bao giờ phải sửa nó lần nữa.

## Quy trình

1. **Viết luật thành một câu ra lệnh.** Không phải "nên tránh…" mà "X đi qua Y, không bao giờ Z".
   Nêu rõ thứ ĐÚNG, không chỉ thứ sai.

2. **Viết `why`.** Bắt buộc. Nêu hậu quả cụ thể, không nêu nguyên tắc chung — "một `<svg>` tự vẽ lệch
   stroke width nên trông sai ở dark mode" chứ không phải "nhất quán là tốt". Một luật không có lý do
   sẽ bị người sau gỡ vì tưởng nó là sở thích tuỳ tiện.

3. **Tìm `canonical`.** Chỗ nào trong repo đang làm ĐÚNG? Đó là chỗ để copy. Nếu chưa có thì tạo nó
   trước khi khoá luật.

4. **Thử biến nó thành check máy.** Đây là bước quan trọng nhất, và là bước hay bị bỏ.
   - `forbid` — mẫu không được xuất hiện. Hỏi: "code sai trông như thế nào trên một DÒNG?"
   - `require-with` — nếu file có `when` thì phải có `then`.
   - `forbid-import` — thư mục A không được import từ B.
   - `require` — mọi file trong phạm vi phải có mẫu này.
   - `manual` — CHỈ khi đã thử ba cái trên và không cái nào diễn tả được. Ghi lại là đã thử gì.

5. **Chạy thử trước khi commit.** Một regex quá rộng còn tệ hơn không có luật: nó chặn cả cách làm
   đúng, rồi người ta học cách bỏ qua cổng.
   ```bash
   node packages/guards/bin/guards.mjs --root .
   ```
   Nếu nó bắt code đang đúng thì hẹp regex lại, đừng thêm `allow`.

6. **`allow` chỉ khi thật là ngoại lệ**, và mỗi mục phải kèm lý do dài hơn 20 ký tự — có test cưỡng
   chế điều đó. "file sinh tự động" không đủ; phải nói vì sao file đó được miễn.

7. **Thêm vào cuối `patterns`** trong `packages/ui-patterns/src/ui-patterns.json`. Registry là
   CHỈ-THÊM: đừng sửa luật cũ để nhồi ý mới vào, hãy thêm luật mới.

## Cấu trúc một mục

```json
{
  "id": "kebab-case-ngan",
  "rule": "Câu ra lệnh, nêu cả thứ đúng.",
  "why": "Hậu quả cụ thể nếu phá luật.",
  "canonical": "đường/dẫn/làm-đúng.tsx",
  "source": "thienui · YYYY-MM-DD",
  "check": { "kind": "forbid", "pattern": "regex" },
  "allow": { "file/được/miễn.tsx": "lý do đủ dài để giải thích được" }
}
```

## Sau khi thêm

```bash
pnpm --filter @thienui/guards test   # registry phải hợp lệ
node packages/guards/bin/guards.mjs --root .   # repo phải sạch
```
