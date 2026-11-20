export type UserRole = "student" | "lecturer" | "employee" | "admin";

export const DEPARTMENTS = [
  "CIVIL",
  "EEE",
  "MECH",
  "ECE",
  "CSE",
  "CSE-AIML",
  "CSE-DS",
  "CSE-IoT",
  "AI&DS",
  "AGRI",
  "BSH",
  "MBA",
  "MCA",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const YEARS = ["1st", "2nd", "3rd", "4th", "Alumni"] as const;
export type AcademicYear = (typeof YEARS)[number];

export interface Profile {
  id: string;
  name: string;
  roll_number: string | null;
  employee_id: string | null;
  role: UserRole;
  department: string | null;
  year: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FacultyMember {
  name: string;
  designation: string;
  joined: string;
  qualification: string;
  department: string;
}

export interface DepartmentInfo {
  code: Department;
  name: string;
  hod: string | null;
  facultyKeys: string[];
  notes: string[];
  source: string;
}

export interface CampusPlace {
  id: string;
  name: string;
  category: "academic" | "facility" | "residential" | "service" | "landmark";
  details: string;
}

export interface HelplineEntry {
  name: string;
  designation: string;
  phone?: string;
  qualification?: string;
}

export interface CampusEvent {
  title: string;
  window: string;
  scope: string;
}

export interface Announcement {
  title: string;
  detail: string;
  source: string;
}
