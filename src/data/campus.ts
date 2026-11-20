import type {
  Announcement,
  CampusEvent,
  CampusPlace,
  DepartmentInfo,
  HelplineEntry,
} from "@/types";

/**
 * All content in this file is transcribed from material supplied by the user:
 * the SIETK Public Information Dossier (snapshot 8 August 2026) and the
 * hand-drawn campus map. Nothing here is invented.
 */

export const CAMPUS = {
  code: "sietk",
  name: "Siddharth Institute of Engineering & Technology",
  city: "Puttur",
  address:
    "Siddharth Nagar, Narayana Vanam Road, Puttur, Chittoor District, Andhra Pradesh, India, PIN 517583",
  phone: "08577-264999",
  fax: "08577-264888",
  website: "sietk.org",
  emailDomain: "@sietk.edu.in",
} as const;

export const DEPARTMENT_INFO: DepartmentInfo[] = [
  {
    code: "CIVIL",
    name: "Civil Engineering",
    hod: "Dr. G. Prabhakaran (Professor & HOD)",
    facultyKeys: [],
    notes: ["Board of Studies page confirms Dr. G. Prabhakaran as Chairman/HOD."],
    source: "https://sietk.org/",
  },
  {
    code: "EEE",
    name: "Electrical & Electronics Engineering",
    hod: "Dr. N. Ramesh Raju (Professor & HOD)",
    facultyKeys: ["EEE"],
    notes: [
      "Founded in 2002; intake 60 increased to 120.",
      "42 faculty members stated on the department page.",
      "Labs: Electrical Machines, Basic Electrical & Network, Control & Instrumentation, Power Electronics & Drives.",
      "Department page lists PEOs/PSOs and 11 Board of Studies meetings.",
    ],
    source: "https://sietk.org/eee_dept.php",
  },
  {
    code: "MECH",
    name: "Mechanical Engineering",
    hod: "Dr. S. Sunil Kumar Reddy (Professor & HOD)",
    facultyKeys: [],
    notes: [
      "Established 2004; B.Tech intake 120; M.Tech Thermal Engineering intake 18.",
      "Research centre sanctioned by JNTU Anantapur; more than 300 papers stated.",
      "Labs include design CBT, refrigeration & air conditioning, automobile 2/4-wheeler, Dassault 3D experience.",
    ],
    source: "https://sietk.org/mech_dept.php",
  },
  {
    code: "ECE",
    name: "Electronics & Communication Engineering",
    hod: "Dr. Ratna Kamala Petla (Professor & HOD)",
    facultyKeys: ["ECE"],
    notes: [
      "Established in 2001; annual intake increased from 60 to 300.",
      "M.Tech specializations listed: VLSI Design, DECS and Embedded Systems.",
    ],
    source: "https://www.sietk.org/ece_dept.php",
  },
  {
    code: "CSE",
    name: "Computer Science & Engineering",
    hod: "Dr. R. M. Mallika (Professor & HOD)",
    facultyKeys: ["CSIT", "CSE-CC"],
    notes: [
      "CSE established in 2001 with initial intake 60.",
      "Published results analysis, Board of Studies, research supervisors and industry integration.",
      "Related programmes published by SIETK: CSIT (HOD B. Rajakumar) and CSE - Cloud Computing.",
    ],
    source: "https://www.sietk.org/cse_dept.php",
  },
  {
    code: "CSE-AIML",
    name: "CSE - Artificial Intelligence & Machine Learning",
    hod: null,
    facultyKeys: ["CSE-AI"],
    notes: [
      "HOD page exists; the faculty page labels the programme CSM / AI & ML.",
      "The published CSE - Artificial Intelligence faculty list is shown here.",
    ],
    source: "https://www.sietk.org/cse_ai_ml_dept.php",
  },
  {
    code: "CSE-DS",
    name: "CSE - Data Science",
    hod: null,
    facultyKeys: ["AI&DS"],
    notes: ["SIETK publishes this programme as CSE - AI & Data Science (CAD)."],
    source: "https://www.sietk.org/cse_ai_ds_dept.php",
  },
  {
    code: "CSE-IoT",
    name: "CSE - IoT & Cyber Security (incl. BCT)",
    hod: null,
    facultyKeys: [],
    notes: ["Department link exists in the main SIETK navigation (CIC programme)."],
    source: "https://sietk.org/",
  },
  {
    code: "AI&DS",
    name: "CSE - AI & Data Science",
    hod: null,
    facultyKeys: ["AI&DS"],
    notes: ["Faculty list published for academic year 2024-25 (16 records)."],
    source: "https://www.sietk.org/cse_ai_ds_dept.php",
  },
  {
    code: "AGRI",
    name: "Agricultural Engineering",
    hod: null,
    facultyKeys: [],
    notes: ["Department page is part of SIETK navigation; roster not published in the dossier."],
    source: "https://sietk.org/",
  },
  {
    code: "BSH",
    name: "Basic Sciences & Humanities",
    hod: "Prof. B. Harikrishna (HOD)",
    facultyKeys: ["BSH"],
    notes: ["Faculty page includes Mathematics, Science and Humanities faculty."],
    source: "https://www.sietk.org/bsh_dept.php",
  },
  {
    code: "MBA",
    name: "Master of Business Administration",
    hod: "Dr. M. Jayalakshmi (Associate Professor & HOD)",
    facultyKeys: ["MBA"],
    notes: [
      "Established 2006; intake increased from 60 to 120.",
      "Approved research centre by JNTUA stated.",
      "Note: the MBA narrative page names Dr. M. Vani as head while the faculty table lists Dr. M. Jayalakshmi. Verify with the institute.",
    ],
    source: "https://www.sietk.org/mba_dept.php",
  },
  {
    code: "MCA",
    name: "Master of Computer Applications",
    hod: "Mr. J. S. Ananda Kumar (HOD)",
    facultyKeys: [],
    notes: ["Established 2006 with intake 60; AICTE-approved and affiliated to JNTUA."],
    source: "https://www.sietk.org/mca_dept.php",
  },
];

export const ADMINISTRATION: HelplineEntry[] = [
  {
    name: "Dr. P. Ramesh Kumar",
    designation: "Principal",
    qualification:
      "Ph.D. Mechanical Engineering; M.E. Thermal Power Engineering; 31+ years experience stated",
  },
  {
    name: "Dr. Bogala Madhu",
    designation: "Vice-Principal",
    qualification: "Ph.D. Agricultural Engineering; M.Tech Agricultural Processing & Food Engineering",
  },
  {
    name: "Dr. C. Priya",
    designation: "Dean - R&D",
    qualification: "M.E. VLSI Design (Gold Medalist), Ph.D.; 21+ years teaching experience stated",
  },
  {
    name: "Dr. J. Gowrishankar",
    designation: "R&D Deputy Dean",
    qualification: "B.E. EEE, M.E. Power Electronics & Drives, Ph.D.",
  },
  {
    name: "Dr. G. Prabhakaran",
    designation: "Dean - Student Welfare",
    qualification: "Professor of Civil Engineering; Ph.D. Environmental Engineering",
  },
  {
    name: "Prof. C. Siva Kumar Prasad",
    designation: "Dean Academics",
    qualification: "M.Tech Building Technology & Construction Management, IIT Madras",
  },
];

export const EXAM_CELL: HelplineEntry[] = [
  {
    name: "Dr. Vijaya Bhaskar C",
    designation: "Controller of Examinations",
    phone: "+91-9396931333",
    qualification: "M.Tech., Ph.D.",
  },
  {
    name: "D. Muneendra",
    designation: "Additional Controller of Examinations-1",
    phone: "9849897895",
    qualification: "M.Tech, (Ph.D)",
  },
  {
    name: "Dr. Madhu D",
    designation: "Additional Controller of Examinations-2",
    phone: "+91-9492659320",
    qualification: "M.Tech, Ph.D",
  },
  {
    name: "Dr. B A Devan",
    designation: "Additional Controller of Examinations-3",
    phone: "+91-8019539384",
    qualification: "M.Tech, Ph.D",
  },
];

export const CAMPUS_PLACES: CampusPlace[] = [
  { id: "main-gate", name: "Main Gate", category: "landmark", details: "Opens onto College Road; security room with in-pass / out-pass beside it." },
  { id: "security", name: "Security Room", category: "service", details: "In-pass / out-pass handled here, next to the main gate." },
  { id: "logo-pole", name: "Logo Pole", category: "landmark", details: "Central junction between the entry drive and the block roads." },
  { id: "a-block", name: "A-Block", category: "academic", details: "Ground floor lab (Electronics). 2nd, 3rd and 4th floors: classrooms and staff rooms. Examination cell on the 2nd floor - pay fees / take hall tickets. Connected to B-Block by a bridge." },
  { id: "b-block", name: "B-Block (Administrative Block)", category: "academic", details: "Chairman room, principal room, meeting room, wash rooms and book room. Classrooms on second and third floors." },
  { id: "library", name: "Central Library", category: "facility", details: "2 floors, with connection on the 3rd and 4th floors." },
  { id: "c-block", name: "C-Block", category: "academic", details: "ECE students, HOD and staff; classrooms. Reached by the B and C block road." },
  { id: "audi-block", name: "Audi-Block", category: "academic", details: "Auditorium plus classrooms and labs. Computer labs and HR panels on the 2nd, 3rd and 4th floors; Idea Lab. Washroom on every floor." },
  { id: "d-block", name: "D-Block", category: "academic", details: "Drawing labs, classrooms and staff." },
  { id: "canteen", name: "Canteen", category: "facility", details: "Next to D-Block, on the road below the logo pole." },
  { id: "workshop", name: "Workshop Labs", category: "academic", details: "North-west corner of the campus, beside the girls hostel." },
  { id: "girls-hostel", name: "Girls Hostel", category: "residential", details: "North-west corner of the campus." },
  { id: "boys-hostel", name: "Boys Hostel Road", category: "residential", details: "Leads off the east side road." },
  { id: "ground", name: "Ground", category: "facility", details: "Open ground in the north of the campus." },
  { id: "sistek", name: "SISTEK Campus", category: "academic", details: "East side, with labs and staff areas." },
  { id: "construction", name: "Construction Building", category: "facility", details: "East side, beyond the road." },
  { id: "study-sitting", name: "Study Sitting Area", category: "facility", details: "Between the students way and D-Block." },
  { id: "parking-inside", name: "Inside Parking", category: "service", details: "West of the entry drive." },
  { id: "parking-bike", name: "Bike Parking (outside)", category: "service", details: "Outside the campus, along College Road." },
];

export const EVENTS: CampusEvent[] = [
  { title: "B.Tech May/June 2026 regular & supplementary examinations", window: "2025-26 notifications", scope: "B.Tech" },
  { title: "M.Tech August 2026 examinations", window: "2025-26 notifications", scope: "M.Tech" },
  { title: "I M.Tech II-semester II-mid and regular examinations", window: "August 2026", scope: "M.Tech" },
  { title: "B.Tech R23 I/II semester regular, supplementary and mid-term examinations", window: "During 2025-26", scope: "B.Tech" },
  { title: "Academic calendars published for B.Tech II, III, IV years, MCA II and MBA II", window: "2026-27", scope: "All programmes" },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    title: "Revaluation and recounting notices published",
    detail: "Included in the 2025-26 examination notifications on the Examination Section page.",
    source: "https://sietk.org/exam_cell_notifications.php",
  },
  {
    title: "Regulations in force",
    detail:
      "B.Tech R23, R20, R19, R18, R16; M.Tech / MBA / MCA R25, R20, R19, R18, R16. R23 B.Tech is a four-year autonomous programme for batches admitted from 2023-24, with lateral entry from 2024-25.",
    source: "https://sietk.org/regulations.php",
  },
  {
    title: "UG syllabus R23 curricula published",
    detail:
      "Civil, EEE, Mechanical, ECE, CSE, CSIT, CSM (AI/ML), CIC (IoT & Cyber Security incl. BCT), CAD (AI/DS), CCC (Cloud Computing), CAI (AI) and CIA (IoT & Automation).",
    source: "https://sietk.org/syllabus_ug.php",
  },
  {
    title: "Personnel records are inconsistent across pages",
    detail:
      "The Principal page names Dr. P. Ramesh Kumar while the Academic Council, Governing Body and Finance Committee pages still list Dr. K. Chandrasekhar Reddy as Principal.",
    source: "https://sietk.org/",
  },
];

export const CSE_RESULTS = [
  { year: "2024-25", ivOdd: "92.14", ivEven: "", iiiOdd: "87.74", iiiEven: "", iiOdd: "73.94", iiEven: "" },
  { year: "2023-24", ivOdd: "83.43", ivEven: "93.97", iiiOdd: "81.13", iiiEven: "84.91", iiOdd: "84.18", iiEven: "69.49" },
  { year: "2022-23", ivOdd: "82.10", ivEven: "91.36", iiiOdd: "70.41", iiiEven: "71.01", iiOdd: "70.19", iiEven: "78.88" },
  { year: "2021-22", ivOdd: "", ivEven: "", iiiOdd: "80.84", iiiEven: "80.61", iiOdd: "72.19", iiEven: "73.30" },
];
