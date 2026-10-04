export function checkCanonicals(
  root: string,
  registry: { patterns: { id: string; canonical?: string }[] }
): {
  pass: boolean;
  missing: { id: string; canonical: string }[];
  /** Luật thiếu hẳn trường `canonical`. Dùng '—' nếu cố ý không có. */
  noCanonical: string[];
};
