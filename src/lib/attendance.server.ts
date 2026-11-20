/**
 * Server-only reader for the sietk student portal (webprosindia College
 * Automation Package). Credentials are used for a single request chain and
 * are never stored or logged.
 */
import { createCipheriv } from "node:crypto";

const PORTAL_BASE = "https://webprosindia.com/sietk/";
const LOGIN_PATH = "Default.aspx";
const ATTENDANCE_PAGE = "Academics/studentattendance.aspx";
/** Fixed key/IV used by the portal's own client-side login script. */
const PORTAL_KEY = "8701661282118308";
const UA = "Mozilla/5.0 (compatible; CampusAI/1.0)";

export interface AttendanceSubject {
  subject: string;
  conducted: number | null;
  attended: number | null;
  percentage: number | null;
}

export interface AttendanceReport {
  subjects: AttendanceSubject[];
  overallPercentage: number | null;
  totalConducted: number | null;
  totalAttended: number | null;
  studentName: string | null;
  branch: string | null;
  semester: string | null;
  fetchedAt: string;
}

function encryptPassword(plain: string): string {
  const key = Buffer.from(PORTAL_KEY, "utf8");
  const cipher = createCipheriv("aes-128-cbc", key, key);
  return Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]).toString("base64");
}

function readCookies(res: Response, jar: Map<string, string>) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const cookie of raw) {
    const [pair] = cookie.split(";");
    if (!pair) continue;
    const i = pair.indexOf("=");
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1));
  }
}

function cookieHeader(jar: Map<string, string>) {
  return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
}

function hiddenField(html: string, name: string): string {
  const m = html.match(new RegExp(`name="${name}"[^>]*value="([^"]*)"`));
  return m?.[1] ?? "";
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string): number | null {
  const m = value.match(/-?\d*\.?\d+/);
  return m ? Number(m[0]) : null;
}

function tableRows(html: string): string[][] {
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...(r[1] ?? "").matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => stripTags(c[1] ?? "")),
  );
}

/** Parses the attendance report HTML returned by the portal's ajax endpoint. */
export function parseAttendanceHtml(html: string): AttendanceReport {
  const rows = tableRows(html);

  const subjects: AttendanceSubject[] = [];
  let overallPercentage: number | null = null;
  let totalConducted: number | null = null;
  let totalAttended: number | null = null;
  let studentName: string | null = null;
  let branch: string | null = null;
  let semester: string | null = null;

  for (const cells of rows) {
    const label = cells[0] ?? "";

    // Header rows: RollNo / Student Name / Course / Branch / Semester : value
    if (cells.length === 3 && cells[1] === ":") {
      const value = cells[2] ?? "";
      if (/student name/i.test(label)) studentName = value || null;
      else if (/branch/i.test(label)) branch = value || null;
      else if (/semester/i.test(label)) semester = value || null;
      continue;
    }

    if (/total/i.test(label) && cells.length >= 4) {
      totalConducted = parseNumber(cells[1] ?? "");
      totalAttended = parseNumber(cells[2] ?? "");
      overallPercentage = parseNumber(cells[3] ?? "");
      continue;
    }

    // Data rows: Sl.No | Subject | Held | Attend | %
    if (cells.length >= 5 && /^\d+$/.test(label)) {
      const subject = cells[1] ?? "";
      if (!subject) continue;
      const conducted = parseNumber(cells[2] ?? "");
      const attended = parseNumber(cells[3] ?? "");
      const percentage = parseNumber(cells[4] ?? "");
      subjects.push({ subject, conducted, attended, percentage });
    }
  }

  if (overallPercentage === null && subjects.length > 0) {
    const conducted = subjects.reduce((s, x) => s + (x.conducted ?? 0), 0);
    const attended = subjects.reduce((s, x) => s + (x.attended ?? 0), 0);
    if (conducted > 0) {
      totalConducted = conducted;
      totalAttended = attended;
      overallPercentage = Math.round((attended / conducted) * 1000) / 10;
    }
  }

  return {
    subjects,
    overallPercentage,
    totalConducted,
    totalAttended,
    studentName,
    branch,
    semester,
    fetchedAt: new Date().toISOString(),
  };
}

/** Unwraps the single-quoted JS string literal the ajax endpoint returns. */
function unwrapAjaxString(raw: string): string {
  const trimmed = raw.trim();
  const inner =
    trimmed.startsWith("'") && trimmed.endsWith("'") ? trimmed.slice(1, -1) : trimmed;
  return inner
    .replace(/\\r\\n/g, " ")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export async function fetchPortalAttendance(
  studentId: string,
  password: string,
): Promise<AttendanceReport> {
  const jar = new Map<string, string>();

  const loginPage = await fetch(PORTAL_BASE + LOGIN_PATH, { headers: { "User-Agent": UA } });
  if (!loginPage.ok) throw new Error("The college portal is not responding right now.");
  readCookies(loginPage, jar);
  const html = await loginPage.text();

  const encrypted = encryptPassword(password);
  const loginRes = await fetch(PORTAL_BASE + LOGIN_PATH, {
    method: "POST",
    redirect: "manual",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(jar),
    },
    body: new URLSearchParams({
      __VIEWSTATE: hiddenField(html, "__VIEWSTATE"),
      __VIEWSTATEGENERATOR: hiddenField(html, "__VIEWSTATEGENERATOR"),
      __EVENTVALIDATION: hiddenField(html, "__EVENTVALIDATION"),
      txtId2: studentId,
      txtPwd2: encrypted,
      hdnpwd2: encrypted,
      "imgBtn2.x": "20",
      "imgBtn2.y": "10",
    }),
  });
  readCookies(loginRes, jar);

  const landing = loginRes.headers.get("location") ?? "";
  if (!/StudentMaster\.aspx/i.test(landing)) {
    throw new Error("The portal rejected those credentials. Check your ID and password.");
  }

  const pageRes = await fetch(PORTAL_BASE + ATTENDANCE_PAGE, {
    headers: { "User-Agent": UA, Cookie: cookieHeader(jar) },
  });
  if (!pageRes.ok) throw new Error("The college portal is not responding right now.");
  const pageHtml = await pageRes.text();

  // The report is produced by an AjaxPro handler whose hashed path is in the page.
  const handler =
    pageHtml.match(/src="([^"]*ajax\/StudentAttendance[^"]*\.ashx)"/i)?.[1] ??
    pageHtml.match(/url:'([^']*ajax\/StudentAttendance[^']*\.ashx)'/i)?.[1];
  if (!handler) throw new Error("The portal changed its attendance page. Please try again later.");

  const reportRes = await fetch(
    new URL(handler, PORTAL_BASE).toString() + "?_method=ShowAttendance&_session=r",
    {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Cookie: cookieHeader(jar),
        "Content-Type": "text/plain; charset=utf-8",
      },
      // "Till now" report: empty date range.
      body: `rollNo=${JSON.stringify(studentId)}\r\nfromDate=""\r\ntoDate=""\r\nexcludeothersubjects=false`,
    },
  );
  if (!reportRes.ok) throw new Error("The college portal is not responding right now.");

  const report = parseAttendanceHtml(unwrapAjaxString(await reportRes.text()));
  if (report.subjects.length === 0) {
    throw new Error("Signed in, but the portal returned no attendance rows for this account.");
  }
  return report;
}
