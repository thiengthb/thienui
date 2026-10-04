/**
 * Type cho cổng contrast.
 *
 * Package này là JS thuần + JSDoc (không build step, chạy ở mọi nơi, import được từ vitest và từ
 * server component). Nhưng type SUY TỪ LITERAL thì lỏng: `mode` ra `string`, `tier` ra `string`,
 * `floor` ra `any`. Nới type ở từng chỗ dùng là sai chỗ — mỗi consumer sẽ nới một kiểu, và chỗ nào
 * cast thì chỗ đó mất luôn khả năng bắt lệch type thật. Khai một lần ở đây.
 */

export type Mode = 'light' | 'dark';
export type Tier = 'text' | 'graphic' | 'decor';

export const AA_TEXT: 4.5;
export const AA_GRAPHIC: 3;
export const FLOOR: Record<Tier, number>;

export type PolicyRule = {
  token: string;
  on: string[];
  tier: Tier;
  where: string;
};

export const POLICY: PolicyRule[];
export const ALLOW: Record<string, string>;

export type ContrastResult = {
  theme: string;
  mode: Mode;
  fg: string;
  bg: string;
  /** Vắng khi cặp không đo được (token không tồn tại) — lúc đó `reason` có mặt. */
  tier?: Tier;
  ratio: number;
  floor: number;
  pass: boolean;
  /** Lý do miễn trừ, nếu cặp này nằm trong ALLOW. */
  allowed?: string | null;
  where?: string;
  /** Chỉ có khi cặp KHÔNG đo được: token hoặc mặt không tồn tại trong theme. */
  reason?: string;
};

export type TokensFile = {
  primitive: Record<string, string | number>;
  themes: Record<string, Record<Mode, Record<string, string>>>;
  meta: { name: string; label: string; default: boolean }[];
};

export function checkContrast(
  tokens: TokensFile,
  opts?: { policy?: PolicyRule[]; allow?: Record<string, string> }
): { pass: boolean; results: ContrastResult[]; failures: ContrastResult[] };

export function checkGamut(tokens: TokensFile): {
  pass: boolean;
  outOfGamut: { path: string; value: string }[];
};
