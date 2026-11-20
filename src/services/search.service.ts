/**
 * Natural-language search over the official campus knowledge base.
 *
 * The matcher is intent-aware: a question like "where can I study quietly"
 * resolves to the Central Library even though none of those words appear in
 * the indexed text. Everything stays local and deterministic - it never
 * invents facts, it only ranks entries that already exist in the index.
 */
export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  group: string;
  href?: string;
}

export interface RankedResult extends SearchResult {
  score: number;
}

export interface SearchAnswer {
  /** Short plain-language lead-in, or null when nothing matched. */
  intent: string | null;
  results: RankedResult[];
}

export interface SearchService {
  search(query: string): RankedResult[];
  answer(query: string): SearchAnswer;
}

/** Hard cap so a pasted wall of text can never reach the matcher. */
export const MAX_QUERY_LENGTH = 300;

/**
 * Defensive input cleaning. Strips control characters, HTML/markup, and the
 * common "ignore previous instructions" style prompt-injection preambles so
 * user text is only ever treated as a search phrase.
 */
export function sanitizeQuery(raw: string): string {
  return raw
    .slice(0, MAX_QUERY_LENGTH * 4)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[`${}\\|]/g, " ")
    .replace(
      /\b(ignore|disregard|forget)\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)\b/gi,
      " ",
    )
    .replace(/\b(system|developer|assistant)\s*(prompt|message|role)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "am", "do", "does", "did", "i", "me", "my", "we", "you", "your",
  "to", "of", "in", "on", "at", "for", "from", "and", "or", "can", "could", "would", "should",
  "how", "what", "which", "who", "whom", "where", "when", "why", "please", "tell", "show", "find",
  "get", "give", "need", "want", "there", "here", "it", "its", "any", "some", "about", "with",
  "campus", "college", "sietk", "ai", "campusai", "know", "let", "make", "will", "shall", "have",
]);

/** Word -> extra terms that should also be searched. */
const SYNONYMS: Record<string, string[]> = {
  quiet: ["library", "reading", "study"],
  silent: ["library", "reading"],
  study: ["library", "classroom", "reading", "sitting"],
  studying: ["library", "reading"],
  read: ["library", "book"],
  reading: ["library", "book"],
  book: ["library"],
  books: ["library"],
  eat: ["canteen", "food"],
  eating: ["canteen"],
  food: ["canteen"],
  hungry: ["canteen", "food"],
  lunch: ["canteen"],
  snack: ["canteen"],
  tea: ["canteen"],
  coffee: ["canteen"],
  drink: ["canteen", "water"],
  water: ["canteen"],
  toilet: ["bathroom", "washroom", "wash"],
  washroom: ["bathroom", "wash"],
  restroom: ["bathroom", "wash"],
  bathroom: ["wash", "bathroom"],
  sleep: ["hostel"],
  stay: ["hostel"],
  room: ["hostel", "classroom"],
  hostel: ["hostel", "residential"],
  park: ["parking"],
  bike: ["parking"],
  car: ["parking"],
  scooter: ["parking"],
  bus: ["bus", "transport"],
  transport: ["bus"],
  exam: ["examination", "exam cell", "hall ticket"],
  exams: ["examination", "exam cell"],
  hallticket: ["exam cell", "hall ticket"],
  ticket: ["hall ticket", "exam cell"],
  marks: ["examination", "results"],
  result: ["examination", "results"],
  results: ["examination"],
  fee: ["fee", "tender", "examination"],
  fees: ["fee", "tender", "examination"],
  payment: ["fee", "tender"],
  pay: ["fee", "tender"],
  attendance: ["attendance", "classes"],
  percentage: ["attendance"],
  principal: ["principal", "administration"],
  chairman: ["chairman", "administration"],
  hod: ["head of the department", "hod"],
  head: ["hod", "head"],
  teacher: ["faculty", "lecturer", "professor"],
  teachers: ["faculty"],
  faculty: ["faculty", "professor", "lecturer"],
  lecturer: ["faculty"],
  professor: ["faculty"],
  staff: ["faculty", "staff"],
  contact: ["phone", "helpline"],
  phone: ["helpline", "phone"],
  number: ["phone", "helpline"],
  call: ["helpline", "phone"],
  help: ["helpline"],
  emergency: ["helpline", "security"],
  complaint: ["helpline", "administration"],
  lost: ["security", "helpline"],
  security: ["security", "guard"],
  gate: ["main gate", "security"],
  entry: ["main gate"],
  outpass: ["security", "outpass"],
  lab: ["lab", "laboratory", "workshop"],
  labs: ["lab", "workshop"],
  computer: ["computer lab", "lab"],
  seminar: ["auditorium"],
  event: ["auditorium", "events"],
  events: ["auditorium", "events"],
  function: ["auditorium"],
  program: ["auditorium", "events"],
  sport: ["ground", "playground"],
  sports: ["ground"],
  play: ["ground"],
  game: ["ground"],
  cricket: ["ground"],
  gym: ["ground"],
  placement: ["placement", "hr panel", "training"],
  interview: ["hr panel", "placement"],
  job: ["placement"],
  admission: ["administration", "administrative"],
  office: ["administrative", "administration"],
  certificate: ["administrative", "administration"],
  bonafide: ["administrative", "administration"],
  notice: ["announcement", "notification"],
  news: ["announcement"],
  update: ["announcement"],
  holiday: ["calendar", "events"],
  timetable: ["calendar", "events"],
  schedule: ["calendar", "events"],
  cse: ["computer science"],
  ece: ["electronics"],
  eee: ["electrical"],
  mech: ["mechanical"],
  civil: ["civil"],
  ai: ["artificial intelligence"],
  ml: ["machine learning"],
  ds: ["data science"],
  iot: ["internet of things"],
  mba: ["management"],
  mca: ["computer applications"],
};

/** Whole-phrase intents, checked before word level matching. */
const INTENTS: { test: RegExp; terms: string[]; say: string }[] = [
  {
    test: /(quiet|silent|peaceful|calm).*(study|read|place|spot)|(study|read).*(quiet|silent|peaceful)/i,
    terms: ["library", "reading", "sitting"],
    say: "For quiet study, the Central Library and the students' sitting area are the places on campus.",
  },
  { test: /\b(where|how).*(eat|food|hungry|lunch|canteen|snack)\b|\bfood\b/i, terms: ["canteen", "food"], say: "Food on campus is served at the canteen." },
  { test: /\b(hall\s*ticket|exam\s*cell|examination|revaluation|supply)\b/i, terms: ["examination", "exam cell", "hall ticket"], say: "Examination matters are handled by the examination cell." },
  { test: /\b(attendance|percentage of classes|classes attended)\b/i, terms: ["attendance"], say: "Your live attendance is on the Attendance page." },
  { test: /\b(hostel|stay|accommodation|warden)\b/i, terms: ["hostel"], say: "Hostel blocks are marked on the campus map." },
  { test: /\b(park|parking|bike|two wheeler|vehicle)\b/i, terms: ["parking"], say: "Parking areas are marked near the main gate." },
  { test: /\b(emergency|urgent|help ?line|complaint|contact number|phone number)\b/i, terms: ["helpline", "phone", "administration"], say: "Use the helpline channel and the official contacts below." },
  { test: /\b(placement|internship|interview|recruit)\b/i, terms: ["hr panel", "placement", "auditorium"], say: "Placement and HR panel activity happens in the Audi-block upper floors." },
  { test: /\b(who is|hod|head of).*(department|dept|cse|ece|eee|mech|civil|mba|mca)\b/i, terms: ["hod", "department"], say: "Here are the matching department heads." },
  { test: /\b(how (do|can) i (get|reach|go)|route|direction|way to|navigate)\b/i, terms: ["block", "gate", "road"], say: "Open Navigate for a walking route with timing." },
];

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function expand(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const t of tokens) {
    out.add(t);
    for (const s of SYNONYMS[t] ?? []) out.add(s);
    if (t.endsWith("s") && t.length > 3) out.add(t.slice(0, -1));
  }
  return [...out];
}

function scoreEntry(entry: SearchResult, tokens: string[], expanded: string[]): number {
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();
  const group = entry.group.toLowerCase();
  let score = 0;

  for (const t of tokens) {
    if (title.includes(t)) score += 6;
    else if (subtitle.includes(t)) score += 3;
    else if (group.includes(t)) score += 2;
    else if (title.split(/\s+/).some((w) => w.startsWith(t) && t.length > 3)) score += 2;
  }
  for (const t of expanded) {
    if (tokens.includes(t)) continue;
    if (title.includes(t)) score += 3;
    else if (subtitle.includes(t)) score += 1.5;
    else if (group.includes(t)) score += 1;
  }
  return score;
}

export function createLocalSearchService(index: SearchResult[]): SearchService {
  function rank(query: string): { results: RankedResult[]; intent: string | null } {
    const clean = sanitizeQuery(query);
    if (!clean) return { results: [], intent: null };

    const tokens = tokenize(clean);
    const intentHit = INTENTS.find((i) => i.test.test(clean));
    const intentTerms = intentHit ? intentHit.terms.flatMap((t) => t.split(" ")) : [];
    const expanded = expand([...tokens, ...intentTerms]);

    if (tokens.length === 0 && intentTerms.length === 0) return { results: [], intent: null };

    const ranked = index
      .map((entry) => ({ ...entry, score: scoreEntry(entry, tokens, expanded) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 30);

    return { results: ranked, intent: intentHit && ranked.length ? intentHit.say : null };
  }

  return {
    search: (query) => rank(query).results,
    answer: (query) => {
      const { results, intent } = rank(query);
      return { results, intent };
    },
  };
}
