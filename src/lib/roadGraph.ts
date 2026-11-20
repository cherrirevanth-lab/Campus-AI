/**
 * Campus road network used to draw walking directions that follow the roads
 * instead of cutting straight across buildings. All roads are axis-aligned
 * segments in the same 0-100 / 0-105 coordinate space as the digital map.
 */
export interface RoadSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  width: number;
}

export const ROAD_SEGMENTS: RoadSegment[] = [
  { x1: 0, y1: 101.5, x2: 100, y2: 101.5, label: "Main Road", width: 2.4 },
  { x1: 2, y1: 98, x2: 100, y2: 98, label: "College Road", width: 1.6 },
  { x1: 42, y1: 72, x2: 42, y2: 98, label: "College bus way", width: 1.6 },
  { x1: 49, y1: 72, x2: 49, y2: 98, label: "Students way", width: 1.1 },
  { x1: 2, y1: 73, x2: 98, y2: 73, width: 1.8 },
  { x1: 24, y1: 45, x2: 24, y2: 73, width: 1.2 },
  { x1: 50, y1: 34, x2: 50, y2: 73, width: 1.4 },
  { x1: 2, y1: 43, x2: 83, y2: 43, width: 1.2 },
  { x1: 83, y1: 8, x2: 83, y2: 98, width: 1.8 },
  { x1: 24, y1: 7, x2: 24, y2: 45, width: 1.2 },
  { x1: 2, y1: 33, x2: 24, y2: 33, width: 1.1 },
  { x1: 2, y1: 33, x2: 2, y2: 73, width: 1.1 },
  { x1: 66, y1: 43, x2: 66, y2: 73, width: 1.1 },
  { x1: 50, y1: 34, x2: 83, y2: 34, width: 1.1 },
];

export interface Pt {
  x: number;
  y: number;
}

const EPS = 1e-6;
const key = (p: Pt) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

function onSegment(s: RoadSegment, p: Pt) {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len2 = dx * dx + dy * dy;
  const t = ((p.x - s.x1) * dx + (p.y - s.y1) * dy) / len2;
  if (t < -EPS || t > 1 + EPS) return false;
  const px = s.x1 + t * dx;
  const py = s.y1 + t * dy;
  return Math.hypot(px - p.x, py - p.y) < 1e-3;
}

/** Nearest point on a segment to p. */
function project(s: RoadSegment, p: Pt): Pt {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - s.x1) * dx + (p.y - s.y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return { x: s.x1 + t * dx, y: s.y1 + t * dy };
}

/** Closest access point on the whole road network. */
export function snapToRoad(p: Pt): Pt {
  let best: Pt = p;
  let bestD = Infinity;
  for (const s of ROAD_SEGMENTS) {
    const q = project(s, p);
    const d = dist(p, q);
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  }
  return best;
}

function intersection(a: RoadSegment, b: RoadSegment): Pt | null {
  const aH = Math.abs(a.y1 - a.y2) < EPS;
  const bH = Math.abs(b.y1 - b.y2) < EPS;
  if (aH === bH) return null;
  const h = aH ? a : b;
  const v = aH ? b : a;
  const p = { x: v.x1, y: h.y1 };
  return onSegment(h, p) && onSegment(v, p) ? p : null;
}

/** Build a routable graph over the roads, including the two access points. */
function buildGraph(extra: Pt[]) {
  const adj = new Map<string, { to: string; p: Pt; w: number }[]>();
  const add = (a: Pt, b: Pt) => {
    const ka = key(a);
    const kb = key(b);
    if (ka === kb) return;
    const w = dist(a, b);
    if (!adj.has(ka)) adj.set(ka, []);
    if (!adj.has(kb)) adj.set(kb, []);
    adj.get(ka)!.push({ to: kb, p: b, w });
    adj.get(kb)!.push({ to: ka, p: a, w });
  };

  for (const s of ROAD_SEGMENTS) {
    const pts: Pt[] = [
      { x: s.x1, y: s.y1 },
      { x: s.x2, y: s.y2 },
    ];
    for (const o of ROAD_SEGMENTS) {
      if (o === s) continue;
      const p = intersection(s, o);
      if (p) pts.push(p);
    }
    for (const p of extra) if (onSegment(s, p)) pts.push(p);

    const horizontal = Math.abs(s.y1 - s.y2) < EPS;
    pts.sort((p, q) => (horizontal ? p.x - q.x : p.y - q.y));
    for (let i = 0; i < pts.length - 1; i++) add(pts[i]!, pts[i + 1]!);
  }
  return adj;
}

/**
 * Walking polyline from `from` to `to` that leaves the building, follows the
 * campus roads, and enters the destination. Falls back to a straight line if
 * the road network cannot connect the two access points.
 */
export function roadPolyline(from: Pt, to: Pt): Pt[] {
  const a = snapToRoad(from);
  const b = snapToRoad(to);
  const adj = buildGraph([a, b]);

  const start = key(a);
  const goal = key(b);
  if (!adj.has(start) || !adj.has(goal)) return [from, to];

  const distMap = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, { k: string; p: Pt }>();
  const points = new Map<string, Pt>([
    [start, a],
    [goal, b],
  ]);
  const visited = new Set<string>();

  while (true) {
    let cur: string | null = null;
    let best = Infinity;
    for (const [k, d] of distMap) {
      if (!visited.has(k) && d < best) {
        best = d;
        cur = k;
      }
    }
    if (cur === null || cur === goal) break;
    visited.add(cur);
    for (const e of adj.get(cur) ?? []) {
      points.set(e.to, e.p);
      const next = best + e.w;
      if (next < (distMap.get(e.to) ?? Infinity)) {
        distMap.set(e.to, next);
        prev.set(e.to, { k: cur, p: points.get(cur)! });
      }
    }
  }

  if (!distMap.has(goal)) return [from, to];

  const chain: Pt[] = [b];
  let cursor = goal;
  while (cursor !== start) {
    const step = prev.get(cursor);
    if (!step) return [from, to];
    chain.unshift(step.p);
    cursor = step.k;
  }
  return [from, ...chain, to];
}

/** Total length of a polyline. */
export function polylineLength(pts: Pt[]): number {
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) total += dist(pts[i]!, pts[i + 1]!);
  return total;
}

export const toPathD = (pts: Pt[]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
