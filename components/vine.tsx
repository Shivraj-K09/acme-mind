type Point = {
  x: number;
  y: number;
  angle: number;
};

const P0 = { x: 24, y: 232 };
const P1 = { x: 84, y: 196 };
const P2 = { x: 56, y: 96 };
const P3 = { x: 134, y: 16 };

function bezierPoint(
  t: number,
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  d: { x: number; y: number },
): Point {
  const mt = 1 - t;
  const x =
    mt * mt * mt * a.x +
    3 * mt * mt * t * b.x +
    3 * mt * t * t * c.x +
    t * t * t * d.x;
  const y =
    mt * mt * mt * a.y +
    3 * mt * mt * t * b.y +
    3 * mt * t * t * c.y +
    t * t * t * d.y;
  const dx =
    3 * mt * mt * (b.x - a.x) +
    6 * mt * t * (c.x - b.x) +
    3 * t * t * (d.x - c.x);
  const dy =
    3 * mt * mt * (b.y - a.y) +
    6 * mt * t * (c.y - b.y) +
    3 * t * t * (d.y - c.y);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function leafPath(len: number): string {
  const w = len * 0.36;
  return [
    "M 0 0",
    `C ${len * 0.18} ${-w}, ${len * 0.62} ${-w * 1.1}, ${len * 0.92} ${-w * 0.3}`,
    `C ${len * 0.98} ${-w * 0.1}, ${len} ${w * 0.06}, ${len * 0.99} ${w * 0.1}`,
    `C ${len * 0.66} ${w * 0.5}, ${len * 0.2} ${w * 0.42}, 0 0`,
    "Z",
  ].join(" ");
}

function veinPath(len: number): string {
  const w = len * 0.36;
  return `M ${len * 0.06} ${w * 0.04} Q ${len * 0.45} ${-w * 0.3} ${len * 0.94} ${w * 0.06}`;
}

type LeafSpec = {
  t: number;
  side: 1 | -1;
  len: number;
  angle: number;
};

const MAIN_LEAVES: LeafSpec[] = [
  { t: 0.1, side: 1, len: 30, angle: 58 },
  { t: 0.22, side: -1, len: 23, angle: 50 },
  { t: 0.36, side: 1, len: 34, angle: 66 },
  { t: 0.5, side: -1, len: 27, angle: 54 },
  { t: 0.64, side: 1, len: 31, angle: 62 },
  { t: 0.78, side: -1, len: 19, angle: 48 },
  { t: 0.9, side: 1, len: 24, angle: 58 },
];

const BACK_LEAVES: LeafSpec[] = [
  { t: 0.14, side: -1, len: 48, angle: 72 },
  { t: 0.44, side: 1, len: 56, angle: 76 },
  { t: 0.72, side: -1, len: 46, angle: 70 },
];

function Vine({ className }: { className?: string }) {
  const branchStart = bezierPoint(0.38, P0, P1, P2, P3);
  const branch = {
    a: branchStart,
    b: { x: branchStart.x + 20, y: branchStart.y - 6 },
    c: { x: branchStart.x + 38, y: branchStart.y - 20 },
    d: { x: branchStart.x + 52, y: branchStart.y - 42 },
  };

  const branchLeaves: LeafSpec[] = [
    { t: 0.5, side: -1, len: 15, angle: 52 },
    { t: 0.92, side: 1, len: 17, angle: 60 },
  ];

  return (
    <svg
      viewBox="0 0 180 240"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vine-leaf-dark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.95} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.35} />
        </linearGradient>
        <linearGradient id="vine-leaf-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.6} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.15} />
        </linearGradient>
      </defs>

      {BACK_LEAVES.map((leaf, index) => {
        const point = bezierPoint(leaf.t, P0, P1, P2, P3);
        const rotation = point.angle + leaf.side * leaf.angle;
        return (
          <path
            key={`back-${index}`}
            d={leafPath(leaf.len)}
            fill="currentColor"
            fillOpacity={0.3}
            transform={`translate(${point.x} ${point.y}) rotate(${rotation})`}
          />
        );
      })}

      <path
        d={`M ${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`}
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d={`M ${branch.a.x} ${branch.a.y} C ${branch.b.x} ${branch.b.y}, ${branch.c.x} ${branch.c.y}, ${branch.d.x} ${branch.d.y}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {MAIN_LEAVES.map((leaf, index) => {
        const point = bezierPoint(leaf.t, P0, P1, P2, P3);
        const rotation =
          point.angle + leaf.side * (leaf.angle + (index % 3) * 4);
        const gradient =
          index % 2 === 0 ? "url(#vine-leaf-dark)" : "url(#vine-leaf-light)";
        return (
          <g
            key={`main-${index}`}
            transform={`translate(${point.x} ${point.y}) rotate(${rotation})`}
          >
            <path
              d={leafPath(leaf.len)}
              fill={gradient}
              stroke="currentColor"
              strokeOpacity={0.45}
              strokeWidth={1}
              strokeLinejoin="round"
            />
            <path
              d={veinPath(leaf.len)}
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={0.9}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {branchLeaves.map((leaf, index) => {
        const point = bezierPoint(
          leaf.t,
          branch.a,
          branch.b,
          branch.c,
          branch.d,
        );
        const rotation = point.angle + leaf.side * leaf.angle;
        return (
          <g
            key={`branch-${index}`}
            transform={`translate(${point.x} ${point.y}) rotate(${rotation})`}
          >
            <path
              d={leafPath(leaf.len)}
              fill="url(#vine-leaf-dark)"
              stroke="currentColor"
              strokeOpacity={0.45}
              strokeWidth={0.9}
              strokeLinejoin="round"
            />
            <path
              d={veinPath(leaf.len)}
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      <circle cx={P3.x} cy={P3.y} r={3.2} fill="currentColor" />
      <circle
        cx={P3.x + 9}
        cy={P3.y - 12}
        r={2.2}
        fill="currentColor"
        fillOpacity={0.8}
      />
      <circle
        cx={branch.d.x + 6}
        cy={branch.d.y - 8}
        r={2.4}
        fill="currentColor"
        fillOpacity={0.8}
      />
      <circle cx={16} cy={122} r={2} fill="currentColor" fillOpacity={0.6} />
    </svg>
  );
}

export { Vine };
