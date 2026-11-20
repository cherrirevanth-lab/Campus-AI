import { supabase } from "@/integrations/supabase/client";

export interface MapNode {
  id: string;
  name: string;
  category: "academic" | "facility" | "residential" | "service" | "landmark" | string;
  details: string;
  keywords: string[];
  x: number;
  y: number;
  floors: string | null;
}

export interface MapEdge {
  from_node: string;
  to_node: string;
  distance_m: number;
  instruction: string | null;
}

export interface RouteStep {
  instruction: string;
  placeId: string;
  distance_m: number;
}

export interface RouteResult {
  steps: RouteStep[];
  path: string[];
  totalDistance: number;
  minutes: number;
}

/** Comfortable campus walking pace in metres per second. */
export const WALK_SPEED_MPS = 1.25;

export const mapService = {
  async listNodes(): Promise<MapNode[]> {
    const { data, error } = await supabase.from("map_nodes").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as MapNode[];
  },

  async listEdges(): Promise<MapEdge[]> {
    const { data, error } = await supabase
      .from("map_edges")
      .select("from_node,to_node,distance_m,instruction");
    if (error) throw error;
    return (data ?? []) as MapEdge[];
  },
};

export function matchNodes(nodes: MapNode[], query: string): MapNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  return nodes.filter((n) =>
    `${n.name} ${n.details} ${n.keywords.join(" ")} ${n.floors ?? ""}`.toLowerCase().includes(q),
  );
}

/** Dijkstra over the campus walking graph. */
export function findRoute(
  nodes: MapNode[],
  edges: MapEdge[],
  fromId: string,
  toId: string,
): RouteResult | null {
  if (fromId === toId) return { steps: [], path: [fromId], totalDistance: 0, minutes: 0 };

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const adj = new Map<string, MapEdge[]>();
  for (const e of edges) {
    if (!adj.has(e.from_node)) adj.set(e.from_node, []);
    adj.get(e.from_node)!.push(e);
  }

  const dist = new Map<string, number>([[fromId, 0]]);
  const prev = new Map<string, MapEdge>();
  const visited = new Set<string>();

  while (true) {
    let current: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) {
        best = d;
        current = id;
      }
    }
    if (current === null) break;
    if (current === toId) break;
    visited.add(current);

    for (const edge of adj.get(current) ?? []) {
      const next = Number(edge.distance_m) + best;
      if (next < (dist.get(edge.to_node) ?? Infinity)) {
        dist.set(edge.to_node, next);
        prev.set(edge.to_node, edge);
      }
    }
  }

  if (!dist.has(toId)) return null;

  const path: string[] = [toId];
  const usedEdges: MapEdge[] = [];
  let cursor = toId;
  while (cursor !== fromId) {
    const edge = prev.get(cursor);
    if (!edge) return null;
    usedEdges.unshift(edge);
    cursor = edge.from_node;
    path.unshift(cursor);
  }

  const steps: RouteStep[] = usedEdges.map((e) => ({
    instruction:
      e.instruction && e.instruction.trim().length > 0
        ? e.instruction
        : `Continue to ${byId.get(e.to_node)?.name ?? e.to_node}.`,
    placeId: e.to_node,
    distance_m: Number(e.distance_m),
  }));

  const totalDistance = steps.reduce((sum, s) => sum + s.distance_m, 0);
  return {
    steps,
    path,
    totalDistance,
    minutes: Math.max(1, Math.round(totalDistance / WALK_SPEED_MPS / 60)),
  };
}
