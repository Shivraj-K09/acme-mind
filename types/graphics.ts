export type Point = {
  x: number;
  y: number;
  angle?: number;
};

export type BezierPoint = {
  x: number;
  y: number;
  angle: number;
};

export type LeafSpec = {
  t: number;
  side: 1 | -1;
  len: number;
  angle: number;
};
