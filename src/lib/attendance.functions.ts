import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AttendanceReport } from "./attendance.server";

export type { AttendanceReport, AttendanceSubject } from "./attendance.server";

export interface AttendanceResponse {
  report: AttendanceReport | null;
  error: string | null;
}

/**
 * Signs in to the college portal on the server and returns only the parsed
 * attendance rows. Credentials stay in this request - they are never stored.
 */
export const getPortalAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string; password: string }) => {
    const studentId = String(input?.studentId ?? "")
      .trim()
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 24);
    const password = String(input?.password ?? "").slice(0, 128);
    if (!studentId || !password) throw new Error("Enter your portal ID and password.");
    return { studentId, password };
  })
  .handler(async ({ data }): Promise<AttendanceResponse> => {
    const { fetchPortalAttendance } = await import("./attendance.server");
    try {
      const report = await fetchPortalAttendance(data.studentId, data.password);
      return { report, error: null };
    } catch (err) {
      return {
        report: null,
        error: err instanceof Error ? err.message : "Could not reach the college portal.",
      };
    }
  });
