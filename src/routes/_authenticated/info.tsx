import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { adminService, type SiteContent } from "@/services/admin.service";

export const Route = createFileRoute("/_authenticated/info")({
  head: () => ({
    meta: [
      { title: "sietk information - CampusAI" },
      {
        name: "description",
        content:
          "Official sietk information: regulations, syllabus, examination notices and institute details, kept in sync with sietk.org.",
      },
      { property: "og:title", content: "sietk information" },
      {
        property: "og:description",
        content: "Regulations, syllabus and exam notices published by the institute.",
      },
    ],
  }),
  component: InfoPage,
});

function InfoPage() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .listContent()
      .then((rows) => setItems(rows.filter((r) => r.published)))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Information failed to load"),
      );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.title} ${i.body} ${i.section}`.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div>
      <PageHeader
        title="Information"
        icon={BookOpen}
        description="Everything the institute publishes, kept current by the CampusAI admins."
      />

      <div className="card-elevated flex items-center gap-2 p-3">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search regulations, syllabus, notices"
          aria-label="Search information"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <ul className="mt-4 space-y-2">
        {filtered.map((item) => (
          <li key={item.id} className="card-elevated p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.section}
            </p>
            <h2 className="mt-1 text-sm font-semibold">{item.title}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>
            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                Source <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : null}
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="text-sm text-muted-foreground">Nothing published yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
