import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { DEPARTMENT_INFO } from "@/data/campus";
import { FACULTY } from "@/data/faculty";

export const Route = createFileRoute("/_authenticated/departments")({
  head: () => ({
    meta: [
      { title: "sietk departments - leadership, intake and labs" },
      {
        name: "description",
        content:
          "All sietk departments with published heads of department, establishment years, intake and laboratory information.",
      },
      { property: "og:title", content: "sietk departments" },
      {
        property: "og:description",
        content: "Heads of department, intake and labs across the sietk campus.",
      },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const [open, setOpen] = useState<string | null>(null);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of FACULTY) map.set(f.department, (map.get(f.department) ?? 0) + 1);
    return map;
  }, []);

  return (
    <div>
      <PageHeader
        title="Departments"
        icon={Building2}
        description="Department information exactly as published by the institute."
      />

      <ul className="space-y-3">
        {DEPARTMENT_INFO.map((d) => {
          const facultyCount = d.facultyKeys.reduce((n, k) => n + (counts.get(k) ?? 0), 0);
          const expanded = open === d.code;
          return (
            <li key={d.code} className="card-elevated overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : d.code)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold">{d.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {d.hod ?? "Head of department not published"}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                  {d.code}
                </span>
              </button>
              {expanded ? (
                <div className="border-t border-border bg-muted/30 p-4">
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {d.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                    {facultyCount > 0 ? (
                      <li>{facultyCount} faculty records published for this programme.</li>
                    ) : (
                      <li>No faculty roster published in the source material.</li>
                    )}
                  </ul>
                  <p className="mt-3 break-all text-[11px] text-muted-foreground">{d.source}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
