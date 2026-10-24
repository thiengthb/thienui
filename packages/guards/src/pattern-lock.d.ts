export type CheckKind = 'forbid' | 'require' | 'forbid-import' | 'require-with' | 'jsx-class' | 'manual';

export type Check = {
  kind: CheckKind;
  pattern?: string;
  when?: string;
  then?: string;
  /** Glob phạm vi quét. Mặc định: mọi .tsx/.ts/.jsx/.js/.css. */
  files?: string[];
  /** Glob bị loại khỏi phạm vi — dùng để loại code vendor khỏi luật văn phong. */
  exclude?: string[];
  /** Chỉ cho `forbid-import`: glob của các file ĐƯỢC quét. */
  from?: string[];
  /** Chỉ cho `jsx-class`: tên thẻ cần kiểm. */
  tags?: string[];
  /** Chỉ cho `jsx-class`: mọi tên import từ module này đều là thẻ cần kiểm. */
  tagsFrom?: string;
  /** Chỉ cho `jsx-class`: tên thẻ kết thúc bằng hậu tố này cũng được kiểm. */
  tagSuffix?: string;
  /** Chỉ cho `jsx-class`: regex token class bị cấm, đã bỏ tiền tố biến thể. */
  forbidClass?: string;
  /** Chỉ cho `jsx-class`: regex token class được miễn dù khớp `forbidClass`. */
  allowClass?: string;
  /** Chỉ cho `jsx-class`: chỉ tính khi thẻ nằm trong một trong các thẻ cha này. */
  inside?: string[];
};

export type Pattern = {
  id: string;
  rule: string;
  why: string;
  canonical?: string;
  source?: string;
  check: Check;
  /** file -> lý do miễn trừ. Lý do phải dài hơn 20 ký tự; có test cưỡng chế. */
  allow?: Record<string, string>;
};

export type Violation = { file: string; line: number; excerpt: string };

export type CheckResult = {
  violations: Violation[];
  manual?: boolean;
  skipped?: string;
  error?: string;
};

export function runCheck(root: string, pattern: Pattern): CheckResult;
export function runPatternLock(
  root: string,
  registry: { patterns: Pattern[] }
): {
  pass: boolean;
  total: number;
  byPattern: (CheckResult & { id: string; rule: string; canonical?: string })[];
};
export function loadRegistry(file: string): { patterns: Pattern[] };
