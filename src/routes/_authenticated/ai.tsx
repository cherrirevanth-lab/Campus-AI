import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, Search } from "lucide-react";
import { PageHeader } from "@/components/Page";
import {
  createLocalSearchService,
  sanitizeQuery,
  MAX_QUERY_LENGTH,
} from "@/services/search.service";
import { SEARCH_INDEX } from "@/data/searchIndex";
import { aiService } from "@/services/ai.service";
import { CAMPUS } from "@/data/campus";

export const Route = createFileRoute("/_authenticated/ai")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ask CampusAI - sietk campus knowledge" },
      {
        name: "description",
        content:
          "Search official sietk information: departments, faculty, exam cell contacts, campus places and notifications.",
      },
      { property: "og:title", content: "Ask CampusAI - sietk" },
      { property: "og:description", content: "Search official sietk campus information." },
    ],
  }),
  component: AiPage,
});

const searchService = createLocalSearchService(SEARCH_INDEX);

function AiPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(sanitizeQuery(q ?? ""));
  const answer = useMemo(() => searchService.answer(query), [query]);
  const results = answer.results;
  const safeQuery = useMemo(() => sanitizeQuery(query), [query]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const r of results) {
      const list = map.get(r.group) ?? [];
      list.push(r);
      map.set(r.group, list);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <div>
      <PageHeader
        title="Ask CampusAI"
        icon={Bot}
        description={`Ask in your own words - answers are drawn strictly from official ${CAMPUS.code} information held in the app.`}
      />

      <div className="card-elevated flex items-center gap-2 p-3">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={MAX_QUERY_LENGTH}
          placeholder={`Ask anything about ${CAMPUS.code}...`}
          aria-label="Ask CampusAI"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {!aiService.isEnabled() ? (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Questions are understood by intent, then matched against the campus knowledge base. Nothing
          is guessed or invented.
        </p>
      ) : null}

      {answer.intent ? (
        <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          {answer.intent}
        </p>
      ) : null}

      <div className="mt-5 space-y-5">
        {safeQuery === "" ? (
          <p className="text-sm text-muted-foreground">
            Try: &quot;where can I study quietly&quot;, &quot;I&apos;m hungry&quot;, &quot;who is the
            ECE HOD&quot;, &quot;how do I get my hall ticket&quot;.
          </p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing in the official information matches &quot;{safeQuery}&quot;. CampusAI will not
            guess.
          </p>

        ) : (
          grouped.map(([group, items]) => (
            <section key={group}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="card-elevated p-3">
                    <Link to={item.href ?? "/home"} className="block">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
