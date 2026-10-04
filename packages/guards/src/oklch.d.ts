export function oklchToLinearRgb(value: string): [number, number, number];
export function luminance(rgb: [number, number, number]): number;
export function contrast(fg: string, bg: string): number;
export function outOfGamut(value: string): boolean;
/** Giải L cao nhất (hoặc thấp nhất ở dark) mà màu còn vượt `target` trên MỌI nền trong `grounds`. */
export function solveLightness(
  chroma: number,
  hue: number,
  grounds: string[],
  target?: number,
  opts?: { prefer?: 'light' | 'dark' }
): number | null;
