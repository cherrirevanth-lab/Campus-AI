import type { AttendanceReport } from "./attendance.functions";

function esc(value: string | number | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function attendanceToCsv(report: AttendanceReport, studentId: string): string {
  const lines = [
    ["Student ID", studentId].map(esc).join(","),
    ["Generated", new Date(report.fetchedAt).toLocaleString()].map(esc).join(","),
    "",
    ["Subject", "Conducted", "Attended", "Percentage"].join(","),
    ...report.subjects.map((s) =>
      [s.subject, s.conducted, s.attended, s.percentage].map(esc).join(","),
    ),
    ["Overall", report.totalConducted, report.totalAttended, report.overallPercentage]
      .map(esc)
      .join(","),
  ];
  return lines.join("\n");
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function downloadAttendanceCsv(report: AttendanceReport, studentId: string) {
  const blob = new Blob([attendanceToCsv(report, studentId)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${studentId || "summary"}-${fileStamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Opens a clean print sheet; the browser's print dialog can save it as a PDF. */
export function printAttendancePdf(report: AttendanceReport, studentId: string) {
  const rows = report.subjects
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.subject)}</td><td>${s.conducted ?? "-"}</td><td>${s.attended ?? "-"}</td><td>${s.percentage ?? "-"}%</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Attendance summary</title>
<style>
body{font-family:system-ui,sans-serif;margin:32px;color:#0f172a}
h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:#475569;font-size:12px}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}
th{background:#f1f5f9}tfoot td{font-weight:700;background:#f8fafc}
</style></head><body>
<h1>Attendance summary</h1>
<p>Student ID: ${escapeHtml(studentId)} &middot; Generated ${escapeHtml(new Date(report.fetchedAt).toLocaleString())}</p>
<table><thead><tr><th>Subject</th><th>Conducted</th><th>Attended</th><th>%</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td>Overall</td><td>${report.totalConducted ?? "-"}</td><td>${report.totalAttended ?? "-"}</td><td>${report.overallPercentage ?? "-"}%</td></tr></tfoot>
</table>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;

  const win = window.open("", "_blank", "noopener,width=900,height=1000");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
