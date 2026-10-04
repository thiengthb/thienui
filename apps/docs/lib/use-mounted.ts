'use client';

import { useSyncExternalStore } from 'react';

/**
 * "Đã mount ở client chưa?" — không dùng state, không dùng effect.
 *
 * Mẫu quen tay là `const [m, setM] = useState(false); useEffect(() => setM(true), [])`. Nó CHẠY,
 * nhưng nó gọi setState đồng bộ trong effect, nên mỗi component dùng nó tạo thêm một lần render lồng
 * ngay sau hydrate — và luật `react-hooks/set-state-in-effect` bắt đúng điều đó.
 *
 * `useSyncExternalStore` giải đúng bài này: nó nhận một snapshot cho server và một cho client, nên
 * React biết hai bên khác nhau mà không cần ai setState. Không subscribe gì (store không bao giờ
 * đổi) nên `subscribe` trả về một hàm huỷ rỗng.
 */
const noop = () => () => {};
const onClient = () => true;
const onServer = () => false;

export const useMounted = () => useSyncExternalStore(noop, onClient, onServer);
