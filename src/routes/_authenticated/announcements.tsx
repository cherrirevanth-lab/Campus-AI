import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { ANNOUNCEMENTS } from "@/data/campus";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({
    meta: [
      { title: "sietk announcements, notices and regulations" },
      {
        name: "description",
        content:
          "Published sietk notices: revaluation and recounting, regulations in force, R23 UG syllabus and record-quality notes.",
      },
      { property: "og:title", content: "sietk announcements" },
      {
        property: "og:description",
        content: "Notices, regulations and syllabus updates published by sietk.",
      },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <div>
      <PageHeader
        title="Announcements"
        icon={Bell}
        description="Notices and regulation updates as published by the institute."
      />
      <ul className="space-y-3">
        {ANNOUNCEMENTS.map((a) => (
          <li key={a.title} className="card-elevated p-4">
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
            <p className="mt-2 break-all text-[11px] text-muted-foreground">{a.source}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
