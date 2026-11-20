import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Building2, CalendarDays, Compass, LifeBuoy, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { CSE_RESULTS, CAMPUS } from "@/data/campus";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore sietk - departments, faculty and results" },
      {
        name: "description",
        content:
          "Explore official sietk information: departments, faculty directory, helplines, exam events, announcements and published CSE results.",
      },
      { property: "og:title", content: "Explore sietk" },
      {
        property: "og:description",
        content: "Departments, faculty, helplines and published results at sietk.",
      },
    ],
  }),
  component: ExplorePage,
});

const LINKS = [
  { to: "/departments", label: "Departments", icon: Building2, hint: "Leadership, intake and labs" },
  { to: "/faculty", label: "Faculty directory", icon: Users, hint: "Published faculty records" },
  { to: "/helpline", label: "Helpline", icon: LifeBuoy, hint: "Exam cell and administration" },
  { to: "/events", label: "Exam events", icon: CalendarDays, hint: "Calendars and timetables" },
  { to: "/announcements", label: "Announcements", icon: Bell, hint: "Notices and regulations" },
] as const;

function ExplorePage() {
  return (
    <div>
      <PageHeader
        title="Explore"
        icon={Compass}
        description={`Everything ${CAMPUS.code} publishes, organised for students and staff.`}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card-elevated flex items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <l.icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold">{l.label}</span>
              <span className="block text-xs text-muted-foreground">{l.hint}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="card-elevated mt-5 p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">CSE results analysis (published %)</h2>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Year</th>
                <th className="py-2 pr-3 font-medium">IV odd</th>
                <th className="py-2 pr-3 font-medium">IV even</th>
                <th className="py-2 pr-3 font-medium">III odd</th>
                <th className="py-2 pr-3 font-medium">III even</th>
                <th className="py-2 pr-3 font-medium">II odd</th>
                <th className="py-2 font-medium">II even</th>
              </tr>
            </thead>
            <tbody>
              {CSE_RESULTS.map((r) => (
                <tr key={r.year} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium">{r.year}</td>
                  <td className="py-2 pr-3">{r.ivOdd || "-"}</td>
                  <td className="py-2 pr-3">{r.ivEven || "-"}</td>
                  <td className="py-2 pr-3">{r.iiiOdd || "-"}</td>
                  <td className="py-2 pr-3">{r.iiiEven || "-"}</td>
                  <td className="py-2 pr-3">{r.iiOdd || "-"}</td>
                  <td className="py-2">{r.iiEven || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
