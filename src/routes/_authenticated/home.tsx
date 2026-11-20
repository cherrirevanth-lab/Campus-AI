import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,

  LifeBuoy,
  Map as MapIcon,
  Search,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CAMPUS } from "@/data/campus";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "CampusAI Dashboard - sietk campus companion" },
      {
        name: "description",
        content:
          "Your sietk dashboard: campus navigation, departments, faculty directory, helplines, exam events and announcements in one place.",
      },
      { property: "og:title", content: "CampusAI Dashboard - sietk" },
      {
        property: "og:description",
        content: "Navigate sietk, find faculty and departments, and track exam notifications.",
      },
    ],
  }),
  component: HomePage,
});

const QUICK_ACTIONS = [
  { to: "/attendance", label: "Attendance", icon: GraduationCap, hint: "Subject-wise %" },
  { to: "/navigate", label: "Navigate", icon: MapIcon, hint: "Routes & walking time" },

  { to: "/helpline", label: "Helpline", icon: LifeBuoy, hint: "Channel & exam cell" },
  { to: "/info", label: "Information", icon: BookOpen, hint: "Regulations & notices" },
  { to: "/departments", label: "Departments", icon: Building2, hint: "13 departments" },
  { to: "/faculty", label: "Faculty", icon: Users, hint: "Published directory" },
  { to: "/events", label: "Events", icon: CalendarDays, hint: "Exam calendar" },
  { to: "/announcements", label: "Announcements", icon: Bell, hint: "Notices & regulations" },
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function HomePage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const name = profile?.name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.department ? `${profile.department}` : CAMPUS.name}
            {profile?.year ? ` - ${profile.year} year` : ""}
          </p>
        </div>
        <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold lowercase text-accent-foreground">
          {CAMPUS.code}
        </span>
      </header>

      <section className="brand-surface rounded-2xl p-5">
        <p className="text-sm font-medium opacity-90">Ask CampusAI</p>
        <form
          className="mt-3 flex items-center gap-2 rounded-xl bg-background/95 p-2 pl-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/ai", search: { q: query || undefined } });
          }}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask anything about ${CAMPUS.code}...`}
            aria-label="Ask CampusAI"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Ask
          </button>
        </form>
        <p className="mt-2 text-[11px] opacity-80">
          Answers come from official sietk information only.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="card-elevated flex flex-col gap-2 p-4 transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                <a.icon className="size-4.5" aria-hidden />
              </span>
              <span className="text-sm font-semibold">{a.label}</span>
              <span className="text-xs text-muted-foreground">{a.hint}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card-elevated p-4">
        <h2 className="text-sm font-semibold">Campus office</h2>
        <p className="mt-1 text-sm text-muted-foreground">{CAMPUS.address}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <a
            href={`tel:${CAMPUS.phone}`}
            className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted"
          >
            {CAMPUS.phone}
          </a>
          <a
            href={`https://${CAMPUS.website}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted"
          >
            {CAMPUS.website}
          </a>
        </div>
      </section>
    </div>
  );
}
