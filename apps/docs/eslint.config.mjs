import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/r/**']),

  /**
   * `registry/base/**` là code VENDOR, kéo từ registry shadcn và bị `shadcn add` ghi đè.
   *
   * `react-hooks/set-state-in-effect` (luật mới của React) bắt `sidebar.tsx` và `carousel.tsx` —
   * cả hai là mẫu upstream của shadcn, và cả hai là quan ngại thật về render lồng. Nhưng sửa chúng ở
   * đây là sửa một thứ sẽ bị xoá ở lần `shadcn add` tiếp theo, và lúc đó không ai biết nó đã mất.
   *
   * Hạ xuống `warn` CHỈ cho luật này và CHỈ trong `base/**`: vẫn thấy được khi đọc output, nhưng
   * không chặn `pnpm verify` vì một quyết định không thuộc về ta. Mọi luật khác vẫn là error ở đây,
   * và trong code TA VIẾT (`patterns/`, `shells/`, `blocks/`, `app/`) luật này vẫn là error.
   *
   * Đã ghi vào docs/vendor-patches.md, mục "cố ý không patch".
   */
  {
    files: ['registry/base/**/*.{ts,tsx}'],
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
]);

export default eslintConfig;
