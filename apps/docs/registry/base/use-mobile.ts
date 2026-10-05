import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/**
 * PATCH VENDOR — xem docs/vendor-patches.md.
 *
 * Bản upstream dùng `useState` + `useEffect` và gọi `setIsMobile` thẳng trong thân effect, nên
 * `react-hooks/set-state-in-effect` báo ERROR. Trong monorepo này lỗi đó được hạ xuống `warn` cho
 * riêng `registry/base/**` — nhưng `eslint.config.mjs` KHÔNG đi theo registry. Pha 6 đo được hậu
 * quả: `pnpm lint` của một project mới đỏ ngay ngày đầu, trên một file họ không viết và không có
 * ngữ cảnh để hiểu.
 *
 * Nên đây là lần đầu luật "không vá vendor" bị phá, và lý do phá nó là: cái giá không nằm ở ta, nó
 * rơi xuống người dùng. `useSyncExternalStore` còn sửa luôn một nhịp render thừa — bản cũ luôn vẽ
 * một lần với `undefined` rồi mới vẽ lại.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, snapshot, onServer)
}

function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

const snapshot = () => window.matchMedia(QUERY).matches

/** Server không đo được bề rộng. `false` khớp bản upstream, vốn trả `!!undefined` ở lần đầu. */
const onServer = () => false
