import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { GraduationCap, Loader2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/auth.service";
import { CAMPUS } from "@/data/campus";
import { DEPARTMENTS, YEARS, type UserRole } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusAI - the sietk campus companion" },
      {
        name: "description",
        content:
          "CampusAI is the student and staff companion for Siddharth Institute of Engineering and Technology, Puttur: navigation, departments, faculty and exam helplines.",
      },
      { property: "og:title", content: "CampusAI - the sietk campus companion" },
      {
        property: "og:description",
        content: "Sign in with your sietk roll number or employee ID to explore the campus.",
      },
    ],
  }),
  component: LandingPage,
});

const ROLES: { value: Exclude<UserRole, "admin">; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "lecturer", label: "Lecturer" },
  { value: "employee", label: "Employee" },
];

function LandingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("student");
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [year, setYear] = useState<string>(YEARS[0]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/home", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await authService.signIn(email, password);
        if (error) throw error;
        navigate({ to: "/home", replace: true });
      } else {
        const { data, error } = await authService.signUp({
          email,
          identifier,
          password,
          name,
          role,
          department,
          ...(role === "student" ? { year } : {}),
        });

        if (error) throw error;
        if (!data.session) {
          setNotice(`Account created. Check the inbox for ${email.toLowerCase()} to confirm.`);
          setMode("signin");
        } else {
          navigate({ to: "/home", replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="brand-surface px-5 pb-10 pt-12">
        <div className="mx-auto max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" aria-hidden /> {CAMPUS.code} campus
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight">
            CampusAI for {CAMPUS.code}
          </h1>
          <p className="mt-2 text-sm opacity-90">{CAMPUS.name}, Puttur.</p>
          <p className="mt-4 text-sm opacity-90">
            Find any block, department, faculty member or exam contact - answered only from
            officially published institute information.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden /> Campus map with every block and lab
            </li>
            <li className="flex items-center gap-2">
              <GraduationCap className="size-4 shrink-0" aria-hidden /> Departments, faculty and
              results
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" aria-hidden /> Exam cell and administration
              helplines
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-md px-5 pb-16">
        <div className="card-elevated p-5">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors " +
                  (mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
                }
              >
                {m === "signin" ? "Sign in" : "Set up account"}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            {mode === "signup" ? (
              <>
                <Field label="Full name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field"
                    placeholder="As per institute records"
                  />
                </Field>

                <Field label="I am a">
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={
                          "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors " +
                          (role === r.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground")
                        }
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Department">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="field"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>

                {role === "student" ? (
                  <Field label="Year">
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="field"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
              </>
            ) : null}

            {mode === "signup" ? (
              <Field label={role === "student" ? "Roll number" : "Employee ID"}>
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="field"
                  placeholder="e.g. 21KQ1A0501"
                  autoCapitalize="characters"
                />
              </Field>
            ) : null}

            <Field label={mode === "signin" ? "Email" : "Email address"}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="you@example.com"
                autoCapitalize="none"
              />
            </Field>


            <Field label="Password">
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                placeholder="At least 6 characters"
              />
            </Field>

            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Sign in with your email. Your roll number or employee ID stays your campus identity
            inside CampusAI.
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
