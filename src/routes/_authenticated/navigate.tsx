import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Footprints, Map as MapIcon, Search } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { DigitalMap } from "@/components/DigitalMap";
import { CampusMap } from "@/components/CampusMap";
import {
  findRoute,
  mapService,
  matchNodes,
  type MapEdge,
  type MapNode,
  type RouteResult,
} from "@/services/map.service";

export const Route = createFileRoute("/_authenticated/navigate")({
  validateSearch: (search: Record<string, unknown>) => ({
    to: typeof search['to'] === "string" ? (search['to'] as string) : undefined,
    from: typeof search['from'] === "string" ? (search['from'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Navigate the sietk campus - CampusAI" },
      {
        name: "description",
        content:
          "Digital sietk campus map with point-to-point walking routes, step-by-step instructions and arrival time estimates.",
      },
      { property: "og:title", content: "Navigate the sietk campus" },
      {
        property: "og:description",
        content: "Search a block, pick where you are and get a walking route with timing.",
      },
    ],
  }),
  component: NavigatePage,
});

const CATEGORY_LABEL: Record<string, string> = {
  academic: "Academic",
  facility: "Facility",
  residential: "Residential",
  service: "Service",
  landmark: "Landmark",
};

function NavigatePage() {
  const search = Route.useSearch();
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<MapEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fromId, setFromId] = useState<string>("main-gate");
  const [toId, setToId] = useState<string>("");
  const [showSketch, setShowSketch] = useState(false);

  useEffect(() => {
    Promise.all([mapService.listNodes(), mapService.listEdges()])
      .then(([n, e]) => {
        setNodes(n);
        setEdges(e);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Map failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (search.to) setToId(search.to);
    if (search.from) setFromId(search.from);
  }, [search.to, search.from]);

  const filtered = useMemo(() => matchNodes(nodes, query), [nodes, query]);

  const route: RouteResult | null = useMemo(() => {
    if (!fromId || !toId || nodes.length === 0) return null;
    return findRoute(nodes, edges, fromId, toId);
  }, [nodes, edges, fromId, toId]);

  const toNode = nodes.find((n) => n.id === toId);
  const fromNode = nodes.find((n) => n.id === fromId);

  return (
    <div>
      <PageHeader
        title="Navigate"
        icon={MapIcon}
        description="Search a place, set where you are, and follow the walking route."
      />

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <DigitalMap
        nodes={nodes}
        edges={edges}
        path={route?.path ?? []}
        fromId={fromId}
        toId={toId}
        onSelect={(id) => setToId(id)}
      />

      <section className="card-elevated mt-4 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">
              I am at
            </span>
            <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="field">
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">
              Where to
            </span>
            <select value={toId} onChange={(e) => setToId(e.target.value)} className="field">
              <option value="">Select a destination</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Loading campus map...</p> : null}

        {route && toNode ? (
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span>{fromNode?.name}</span>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
              <span>{toNode.name}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 font-semibold text-primary">
                <Clock className="size-3.5" aria-hidden /> about {route.minutes} min walk
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-medium text-muted-foreground">
                <Footprints className="size-3.5" aria-hidden /> {Math.round(route.totalDistance)} m
              </span>
            </div>
            <ol className="mt-3 space-y-2">
              {route.steps.map((s, i) => (
                <li key={`${s.placeId}-${i}`} className="flex gap-3 rounded-xl border border-border p-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm">{s.instruction}</p>
                    <p className="text-[11px] text-muted-foreground">{Math.round(s.distance_m)} m</p>
                  </div>
                </li>
              ))}
            </ol>
            {toNode.floors ? (
              <p className="mt-3 rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                Inside {toNode.name}: {toNode.floors}
              </p>
            ) : null}
          </div>
        ) : toId ? (
          <p className="text-sm text-muted-foreground">No walking path found between those points.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pick a destination, or tap any point on the map.
          </p>
        )}
      </section>

      <div className="card-elevated mt-5 flex items-center gap-2 p-3">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a block, lab or facility"
          aria-label="Search campus places"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((place) => (
          <li key={place.id} className="card-elevated p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{place.name}</h2>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {CATEGORY_LABEL[place.category] ?? place.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{place.details}</p>
            {place.floors ? (
              <p className="mt-1 text-xs text-muted-foreground">{place.floors}</p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setToId(place.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Route here <ArrowRight className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
        {!loading && filtered.length === 0 ? (
          <li className="text-sm text-muted-foreground">No place matches that search.</li>
        ) : null}
      </ul>

      <button
        type="button"
        onClick={() => setShowSketch((s) => !s)}
        className="mt-5 text-xs font-semibold text-primary underline"
      >
        {showSketch ? "Hide" : "Show"} the original hand-drawn sketch
      </button>
      {showSketch ? <CampusMap className="mt-3" /> : null}
    </div>
  );
}
