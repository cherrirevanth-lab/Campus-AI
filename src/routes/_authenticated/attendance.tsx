import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CircleCheck,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { getPortalAttendance, type AttendanceReport } from "@/lib/attendance.functions";
import { downloadAttendanceCsv, printAttendancePdf } from "@/lib/attendance-export";


export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance - CampusAI sietk" },
      {
        name: "description",
        content:
          "See your sietk subject-wise attendance, classes conducted, classes attended and overall percentage in a clean native view.",
      },
      { property: "og:title", content: "Attendance - CampusAI sietk" },
      {
        property: "og:description",
        content: "Subject-wise attendance and overall percentage pulled from the college portal.",
      },
    ],
  }),
  component: AttendancePage,
});

function Ring({ value, size = 64 }: { value: number | null; size?: number }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const tone = pct >= 75 ? "hsl(var(--primary))" : pct >= 65 ? "hsl(43 74% 49%)" : "hsl(var(--destructive))";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size / 4.2}
        fontWeight="700"
        fill="hsl(var(--foreground))"
      >
        {value === null ? "-" : `${Math.round(pct)}%`}
      </text>
    </svg>
  );
}

function AttendancePage() {
  const { profile } = useAuth();
  const fetchAttendance = useServerFn(getPortalAttendance);
  const [studentId, setStudentId] = useState(profile?.roll_number ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AttendanceReport | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetchAttendance({ data: { studentId: studentId.trim(), password } });
      if (res.error) setError(res.error);
      setReport(res.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load attendance.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        icon={GraduationCap}
        description="Subject-wise attendance pulled live from the college portal and rendered here."
      />

      <form onSubmit={submit} className="card-elevated space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">
              Portal student ID
            </span>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Roll number"
              autoComplete="username"
              maxLength={24}
              className="field"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">
              Portal password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              maxLength={128}
              className="field"
              required
            />
          </label>
        </div>
        <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Your portal password is used once on our server to read your attendance. It is never
          saved, logged or shared.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {busy ? "Fetching..." : "Load my attendance"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      {report ? (
        <>
          <section className="card-elevated mt-4 p-4">
            <div className="flex items-center gap-4">
              <Ring value={report.overallPercentage} size={84} />
              <div>
                <h2 className="text-sm font-semibold">Overall attendance</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {report.totalAttended ?? "-"} of {report.totalConducted ?? "-"} classes attended
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CircleCheck className="size-3.5" aria-hidden />
                  Updated {new Date(report.fetchedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => downloadAttendanceCsv(report, studentId.trim())}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
              >
                <Download className="size-3.5" aria-hidden />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  const ok = printAttendancePdf(report, studentId.trim());
                  if (!ok) setError("Allow pop-ups for this site to save the PDF.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
              >
                <FileText className="size-3.5" aria-hidden />
                Save as PDF
              </button>
            </div>
          </section>


          <ul className="mt-4 space-y-2">
            {report.subjects.map((s, i) => (
              <li key={`${s.subject}-${i}`} className="card-elevated flex items-center gap-4 p-3">
                <Ring value={s.percentage} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.attended ?? "-"} attended / {s.conducted ?? "-"} conducted
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
