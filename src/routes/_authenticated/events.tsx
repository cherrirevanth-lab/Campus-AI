import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { EVENTS } from "@/data/campus";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({
    meta: [
      { title: "sietk exam events and academic calendar" },
      {
        name: "description",
        content:
          "Published sietk examination notifications, timetables and academic calendar entries for 2025-26 and 2026-27.",
      },
      { property: "og:title", content: "sietk exam events" },
      {
        property: "og:description",
        content: "Examination notifications, timetables and academic calendars at sietk.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <div>
      <PageHeader
        title="Events"
        icon={CalendarDays}
        description="Examination and academic calendar entries currently published."
      />
      <ul className="space-y-2">
        {EVENTS.map((e) => (
          <li key={e.title} className="card-elevated p-4">
            <p className="text-sm font-semibold">{e.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {e.window} - {e.scope}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Always confirm dates against the official examination section before acting on them.
      </p>
    </div>
  );
}
