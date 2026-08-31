import type { LeafSpec } from "@/types";

export const P0 = { x: 24, y: 232 };
export const P1 = { x: 84, y: 196 };
export const P2 = { x: 56, y: 96 };
export const P3 = { x: 134, y: 16 };

export const MAIN_LEAVES: LeafSpec[] = [
  { t: 0.1, side: 1, len: 30, angle: 58 },
  { t: 0.22, side: -1, len: 23, angle: 50 },
  { t: 0.36, side: 1, len: 34, angle: 66 },
  { t: 0.5, side: -1, len: 27, angle: 54 },
  { t: 0.64, side: 1, len: 31, angle: 62 },
  { t: 0.78, side: -1, len: 19, angle: 48 },
  { t: 0.9, side: 1, len: 24, angle: 58 },
];

export const BACK_LEAVES: LeafSpec[] = [
  { t: 0.14, side: -1, len: 48, angle: 72 },
  { t: 0.44, side: 1, len: 56, angle: 76 },
  { t: 0.72, side: -1, len: 46, angle: 70 },
];
