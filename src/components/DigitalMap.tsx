import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { MapEdge, MapNode } from "@/services/map.service";
import { ROAD_SEGMENTS, roadPolyline, toPathD } from "@/lib/roadGraph";
import { cn } from "@/lib/utils";

const CATEGORY_FILL: Record<string, string> = {
  academic: "var(--primary)",
  facility: "var(--chart-2)",
  residential: "var(--chart-4)",
  service: "var(--muted-foreground)",
  landmark: "var(--destructive)",
};

interface Footprint {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  kind: "building" | "open" | "external";
}

/** Building footprints traced from the detailed campus layout plan. */
const FOOTPRINTS: Footprint[] = [
  { x: 7, y: 7, w: 17, h: 14, label: "Girls Hostel", kind: "building" },
  { x: 1.5, y: 20, w: 12, h: 13, label: "Workshop Labs", kind: "building" },
  { x: 26, y: 8, w: 26, h: 19, label: "Empty place", kind: "open" },
  { x: 24, y: 31, w: 21, h: 11, label: "Empty space", kind: "open" },
  { x: 55, y: 15, w: 23, h: 19, label: "Ground", kind: "open" },
  { x: 84, y: 20, w: 13, h: 11, label: "Boys Hostel Road", kind: "external" },
  { x: 84, y: 33, w: 13, h: 12, label: "Construction Building", kind: "external" },
  { x: 24, y: 45, w: 22, h: 5.5, label: "Central Library (2 floors)", kind: "building" },
  { x: 4, y: 50, w: 20, h: 23, label: "A-Block", kind: "building" },
  { x: 26, y: 52, w: 20, h: 19, label: "B-Block", kind: "building" },
  { x: 53, y: 53, w: 16, h: 19, label: "C-Block", kind: "building" },
  { x: 67, y: 45, w: 15, h: 19, label: "Auditorium / Audi-Block", kind: "building" },
  { x: 85, y: 48, w: 13, h: 23, label: "SISTEK Campus", kind: "external" },
  { x: 6, y: 74, w: 29, h: 21, label: "Inside parking", kind: "open" },
  { x: 52, y: 79, w: 11, h: 9, label: "Students Sitting", kind: "building" },
  { x: 66, y: 75, w: 12, h: 11, label: "D-Block Security (24x7)", kind: "building" },
  { x: 78, y: 74, w: 15, h: 12, label: "Canteen", kind: "building" },
];

/** Roads and walkways come from the shared campus road network. */
const ROADS = ROAD_SEGMENTS;


interface Props {
  nodes: MapNode[];
  edges: MapEdge[];
  path?: string[];
  fromId?: string | null;
  toId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

/**
 * Accurate, zoomable digital campus map. Geometry follows the detailed
 * campus layout plan: main gate and college road at the south, logo pole
 * junction, A/B/C blocks and Auditorium in the middle, ground and hostels
 * to the north, SISTEK campus to the east.
 */
export function DigitalMap({ nodes, edges, path = [], fromId, toId, onSelect, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const pathPairs = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      set.add(`${path[i]}->${path[i + 1]}`);
      set.add(`${path[i + 1]}->${path[i]}`);
    }
    return set;
  }, [path]);

  const uniqueEdges = useMemo(() => {
    const seen = new Set<string>();
    return edges.filter((e) => {
      const key = [e.from_node, e.to_node].sort().join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [edges]);

  const zoomAt = useCallback((nextK: number, px: number, py: number) => {
    setView((v) => {
      const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextK));
      const ratio = k / v.k;
      return { k, x: px - (px - v.x) * ratio, y: py - (py - v.y) * ratio };
    });
  }, []);

  const zoomButton = useCallback(
    (factor: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      zoomAt(viewRef.current.k * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
    },
    [zoomAt],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      zoomAt(
        viewRef.current.k * Math.exp(-dy * 0.0018),
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  function onPointerDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = containerRef.current?.getBoundingClientRect();
      if (pinch.current && rect) {
        zoomAt(
          viewRef.current.k * (dist / pinch.current),
          (a.x + b.x) / 2 - rect.left,
          (a.y + b.y) / 2 - rect.top,
        );
      }
      pinch.current = dist;
      drag.current = null;
      return;
    }

    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    drag.current = { id: d.id, x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }

  function endPointer(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.id === e.pointerId) drag.current = null;
  }

  return (
    <figure className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div
        ref={containerRef}
        className="relative touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
      >
        <svg
          viewBox="0 0 100 105"
          role="img"
          aria-label="Digital map of the sietk campus with blocks, hostels, ground, roads and walking paths"
          className="block h-auto w-full select-none"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: "0 0",
            cursor: view.k > 1 ? "grab" : "default",
          }}
        >
          <rect x="0" y="0" width="100" height="105" fill="var(--muted)" opacity="0.4" />

          {ROADS.map((r, i) => (
            <path
              key={`road-${i}`}
              d={`M${r.x1} ${r.y1} L${r.x2} ${r.y2}`}
              stroke="var(--border)"
              strokeWidth={r.width}
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
          ))}

          {FOOTPRINTS.map((f) => {
            const short = f.label.replace(/\s*\(.*\)\s*/, "").toLowerCase();
            const duplicate = nodes.some(
              (n) => n.name.replace(/\s*\(.*\)\s*/, "").toLowerCase() === short,
            );
            return (
              <g key={f.label}>
                <rect
                  x={f.x}
                  y={f.y}
                  width={f.w}
                  height={f.h}
                  rx="1"
                  fill={
                    f.kind === "building"
                      ? "var(--primary)"
                      : f.kind === "external"
                        ? "var(--muted-foreground)"
                        : "var(--chart-2)"
                  }
                  fillOpacity={f.kind === "building" ? 0.14 : 0.1}
                  stroke="var(--border)"
                  strokeWidth="0.4"
                  strokeDasharray={f.kind === "open" ? "1.5 1" : undefined}
                />
                {duplicate ? null : (
                  <text
                    x={f.x + f.w / 2}
                    y={f.y + 2.6}
                    textAnchor="middle"
                    fontSize="1.8"
                    fill="var(--muted-foreground)"
                    opacity="0.8"
                  >
                    {f.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active route drawn along roads */}
          {path.length >= 2 &&
            (() => {
              const pts: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
              for (let i = 0; i < path.length - 1; i++) {
                const a = byId.get(path[i]!);
                const b = byId.get(path[i + 1]!);
                if (a && b) pts.push({ from: { x: a.x, y: a.y }, to: { x: b.x, y: b.y } });
              }
              return pts.map((p, i) => {
                const pl = roadPolyline(p.from, p.to);
                return (
                  <path
                    key={`route-${i}`}
                    d={toPathD(pl)}
                    stroke="var(--primary)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.9}
                  />
                );
              });
            })()}

          {/* Inactive edges dimmed */}
          {uniqueEdges.map((e) => {
            if (pathPairs.has(`${e.from_node}->${e.to_node}`)) return null;
            const a = byId.get(e.from_node);
            const b = byId.get(e.to_node);
            if (!a || !b) return null;
            return (
              <line
                key={`${e.from_node}-${e.to_node}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--foreground)"
                strokeWidth={0.35}
                strokeLinecap="round"
                strokeDasharray="1 1"
                opacity={0.25}
              />
            );
          })}

          {nodes.map((n) => {
            const isFrom = n.id === fromId;
            const isTo = n.id === toId;
            const onPath = path.includes(n.id);
            return (
              <g
                key={n.id}
                onClick={() => onSelect?.(n.id)}
                className={onSelect ? "cursor-pointer" : undefined}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isFrom || isTo ? 2.2 : onPath ? 1.5 : 1.1}
                  fill={
                    isTo
                      ? "var(--primary)"
                      : isFrom
                        ? "var(--destructive)"
                        : (CATEGORY_FILL[n.category] ?? "var(--muted-foreground)")
                  }
                  stroke="var(--card)"
                  strokeWidth="0.5"
                />
                <text
                  x={n.x}
                  y={n.y - 2.6}
                  textAnchor="middle"
                  fontSize="2"
                  fontWeight={isFrom || isTo ? 700 : 500}
                  fill="var(--foreground)"
                  opacity={onPath || !path.length ? 0.95 : 0.45}
                >
                  {n.name.replace(/\s*\(.*\)\s*/, "")}
                </text>
              </g>
            );
          })}

          {/* Compass */}
          <g opacity="0.7">
            <line x1="94" y1="96" x2="94" y2="90" stroke="var(--foreground)" strokeWidth="0.5" />
            <polygon points="94,88.6 92.9,91.2 95.1,91.2" fill="var(--foreground)" />
            <text x="94" y="99" textAnchor="middle" fontSize="2.4" fill="var(--foreground)">
              N
            </text>
          </g>
        </svg>
      </div>

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {[
          { icon: Plus, label: "Zoom in", action: () => zoomButton(1.4) },
          { icon: Minus, label: "Zoom out", action: () => zoomButton(1 / 1.4) },
          { icon: RotateCcw, label: "Reset view", action: () => setView({ k: 1, x: 0, y: 0 }) },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            aria-label={label}
            className="grid size-8 place-items-center rounded-lg border border-border bg-background/90 text-foreground shadow-sm backdrop-blur"
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>

      <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        Digital campus map - pinch or scroll to zoom, drag to pan, tap a point to set your
        destination.
      </figcaption>
    </figure>
  );
}
