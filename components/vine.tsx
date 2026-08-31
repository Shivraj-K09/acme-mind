import type { BezierPoint, LeafSpec } from "@/types";
import { P0, P1, P2, P3, MAIN_LEAVES, BACK_LEAVES } from "@/constants";

function bezierPoint(
  t: number,
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  d: { x: number; y: number },
): BezierPoint {
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

  const computedBackLeaves = BACK_LEAVES.map((leaf) => {
    const point = bezierPoint(leaf.t, P0, P1, P2, P3);
    const rotation = point.angle + leaf.side * leaf.angle;
    return {
      d: leafPath(leaf.len),
      transform: `translate(${point.x} ${point.y}) rotate(${rotation})`,
    };
  });

  const computedMainLeaves = MAIN_LEAVES.map((leaf, index) => {
    const point = bezierPoint(leaf.t, P0, P1, P2, P3);
    const rotation = point.angle + leaf.side * (leaf.angle + (index % 3) * 4);
    const gradient =
      index % 2 === 0 ? "url(#vine-leaf-dark)" : "url(#vine-leaf-light)";
    return {
      leafD: leafPath(leaf.len),
      veinD: veinPath(leaf.len),
      gradient,
      transform: `translate(${point.x} ${point.y}) rotate(${rotation})`,
    };
  });

  const computedBranchLeaves = branchLeaves.map((leaf) => {
    const point = bezierPoint(leaf.t, branch.a, branch.b, branch.c, branch.d);
    const rotation = point.angle + leaf.side * leaf.angle;
    return {
      leafD: leafPath(leaf.len),
      veinD: veinPath(leaf.len),
      transform: `translate(${point.x} ${point.y}) rotate(${rotation})`,
    };
  });

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

      {computedBackLeaves.map((leaf, index) => (
        <path
          key={`back-${index}`}
          d={leaf.d}
          fill="currentColor"
          fillOpacity={0.3}
          transform={leaf.transform}
        />
      ))}

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

      {computedMainLeaves.map((leaf, index) => (
        <g key={`main-${index}`} transform={leaf.transform}>
          <path
            d={leaf.leafD}
            fill={leaf.gradient}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <path
            d={leaf.veinD}
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
        </g>
      ))}

      {computedBranchLeaves.map((leaf, index) => (
        <g key={`branch-${index}`} transform={leaf.transform}>
          <path
            d={leaf.leafD}
            fill="url(#vine-leaf-dark)"
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
          <path
            d={leaf.veinD}
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </g>
      ))}

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
