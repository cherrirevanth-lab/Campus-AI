import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { FACULTY } from "@/data/faculty";

export const Route = createFileRoute("/_authenticated/faculty")({
  head: () => ({
    meta: [
      { title: "sietk faculty directory - CampusAI" },
      {
        name: "description",
        content:
          "Search the published sietk faculty directory by name, designation, qualification or department.",
      },
      { property: "og:title", content: "sietk faculty directory" },
      {
        property: "og:description",
        content: "Published faculty records across EEE, ECE, CSIT, BS&H, AI&DS, MBA and more.",
      },
    ],
  }),
  component: FacultyPage,
});

function FacultyPage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");

  const departments = useMemo(
    () => [...new Set(FACULTY.map((f) => f.department))].sort(),
    [],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FACULTY.filter(
      (f) =>
        (dept === "all" || f.department === dept) &&
        (!q || `${f.name} ${f.designation} ${f.qualification}`.toLowerCase().includes(q)),
    );
  }, [query, dept]);

  return (
    <div>
      <PageHeader
        title="Faculty"
        icon={Users}
        description="Faculty records published by the institute (lists labelled academic year 2024-25)."
      />

      <div className="card-elevated flex items-center gap-2 p-3">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search faculty by name or designation"
          aria-label="Search faculty"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {["all", ...departments].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDept(d)}
            className={
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (dept === d
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted")
            }
          >
            {d === "all" ? "All" : d}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{rows.length} records</p>

      <ul className="mt-2 space-y-2">
        {rows.map((f) => (
          <li key={`${f.department}-${f.name}`} className="card-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.designation}</p>
              </div>
              <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                {f.department}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {f.qualification} - joined {f.joined}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
