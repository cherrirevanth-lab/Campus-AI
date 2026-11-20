import type { SearchResult } from "@/services/search.service";
import { ANNOUNCEMENTS, ADMINISTRATION, CAMPUS_PLACES, DEPARTMENT_INFO, EVENTS, EXAM_CELL } from "@/data/campus";
import { FACULTY } from "@/data/faculty";

export const SEARCH_INDEX: SearchResult[] = [
  {
    id: "tool-attendance",
    title: "My attendance",
    subtitle: "Subject-wise classes conducted, attended and percentage from the college portal",
    group: "Academics",
    href: "/attendance",
  },
  {
    id: "tool-navigate",
    title: "Campus navigation",
    subtitle: "Walking route, distance and time between any two places on campus",
    group: "Campus places",
    href: "/navigate",
  },

  ...DEPARTMENT_INFO.map((d) => ({
    id: `dept-${d.code}`,
    title: d.name,
    subtitle: d.hod ?? `${d.code} department`,
    group: "Departments",
    href: "/departments",
  })),
  ...FACULTY.map((f, i) => ({
    id: `fac-${i}`,
    title: f.name,
    subtitle: `${f.designation} - ${f.department} - ${f.qualification}`,
    group: "Faculty",
    href: "/faculty",
  })),
  ...ADMINISTRATION.map((a, i) => ({
    id: `adm-${i}`,
    title: a.name,
    subtitle: a.designation,
    group: "Administration",
    href: "/helpline",
  })),
  ...EXAM_CELL.map((a, i) => ({
    id: `exam-${i}`,
    title: a.name,
    subtitle: `${a.designation}${a.phone ? ` - ${a.phone}` : ""}`,
    group: "Examination cell",
    href: "/helpline",
  })),
  ...CAMPUS_PLACES.map((p) => ({
    id: `place-${p.id}`,
    title: p.name,
    subtitle: p.details,
    group: "Campus places",
    href: "/navigate",
  })),
  ...EVENTS.map((e, i) => ({
    id: `ev-${i}`,
    title: e.title,
    subtitle: `${e.window} - ${e.scope}`,
    group: "Exams & calendar",
    href: "/events",
  })),
  ...ANNOUNCEMENTS.map((a, i) => ({
    id: `ann-${i}`,
    title: a.title,
    subtitle: a.detail,
    group: "Announcements",
    href: "/announcements",
  })),
];
