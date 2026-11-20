import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Phone } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { HelplineChannel } from "@/components/HelplineChannel";
import { ADMINISTRATION, CAMPUS, EXAM_CELL } from "@/data/campus";

export const Route = createFileRoute("/_authenticated/helpline")({
  head: () => ({
    meta: [
      { title: "sietk helpline - exam cell and administration contacts" },
      {
        name: "description",
        content:
          "Official sietk contacts: Controller of Examinations, additional controllers, principal, deans and the campus office number.",
      },
      { property: "og:title", content: "sietk helpline" },
      {
        property: "og:description",
        content: "Exam cell phone numbers and senior administration at sietk.",
      },
    ],
  }),
  component: HelplinePage,
});

function HelplinePage() {
  return (
    <div>
      <PageHeader
        title="Helpline"
        icon={LifeBuoy}
        description="One shared channel plus the official contacts published by the institute."
      />

      <HelplineChannel />

      <section className="card-elevated mt-5 p-4">
        <h2 className="text-sm font-semibold">Campus office</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={`tel:${CAMPUS.phone}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Phone className="size-4" aria-hidden /> {CAMPUS.phone}
          </a>
          <span className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
            Fax {CAMPUS.fax}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{CAMPUS.address}</p>
      </section>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">Examination cell</h2>
      <ul className="space-y-2">
        {EXAM_CELL.map((p) => (
          <li key={p.name} className="card-elevated flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.designation}</p>
              {p.qualification ? (
                <p className="text-xs text-muted-foreground">{p.qualification}</p>
              ) : null}
            </div>
            {p.phone ? (
              <a
                href={`tel:${p.phone.replace(/[^+\d]/g, "")}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
              >
                <Phone className="size-3.5" aria-hidden /> Call
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">
        Senior administration
      </h2>
      <ul className="space-y-2">
        {ADMINISTRATION.map((p) => (
          <li key={p.name} className="card-elevated p-4">
            <p className="text-sm font-semibold">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.designation}</p>
            {p.qualification ? (
              <p className="mt-1 text-xs text-muted-foreground">{p.qualification}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        Note: statutory-body pages still list Dr. K. Chandrasekhar Reddy as Principal while the
        Principal page names Dr. P. Ramesh Kumar. Both are reported as published.
      </p>
    </div>
  );
}
