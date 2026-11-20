import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminService, type ActivityRow, type SiteContent } from "@/services/admin.service";
import type { Profile } from "@/types";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin dashboard - CampusAI sietk" },
      {
        name: "description",
        content:
          "Owner dashboard for CampusAI: member list, profiles, site information editing and the activity log.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "CampusAI admin dashboard" },
      { property: "og:description", content: "Manage CampusAI members, content and activity." },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "users" | "content" | "activity";

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "denied" | "ok">("checking");
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [content, setContent] = useState<SiteContent[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setBusy(true);
    try {
      const [u, a, c, act] = await Promise.all([
        adminService.listUsers(),
        adminService.listAdmins(),
        adminService.listContent(),
        adminService.listActivity(),
      ]);
      setUsers(u);
      setAdmins(a);
      setContent(c);
      setActivity(act);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        navigate({ to: "/", replace: true });
        return;
      }
      const ok = await adminService.isAdmin(data.user.id);
      if (!ok) {
        setState("denied");
        return;
      }
      setState("ok");
      void loadAll();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <Shield className="size-8 text-muted-foreground" aria-hidden />
        <h1 className="font-display text-xl font-bold">Admins only</h1>
        <p className="text-sm text-muted-foreground">
          This dashboard is restricted to the CampusAI owner and appointed admins.
        </p>
        <Link to="/home" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Back to CampusAI
        </Link>
      </main>
    );
  }

  const students = users.filter((u) => u.role === "student").length;
  const staff = users.length - students;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Members, site information and everything changing inside CampusAI.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
        >
          <RefreshCw className={"size-3.5 " + (busy ? "animate-spin" : "")} aria-hidden /> Refresh
        </button>
      </header>

      {error ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <nav className="mt-5 grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
        {(
          [
            ["overview", "Overview", Activity],
            ["users", "Users", Users],
            ["content", "Content", FileText],
            ["activity", "Log", Activity],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              "rounded-lg px-2 py-2 text-xs font-semibold transition-colors " +
              (tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Members" value={users.length} />
          <Stat label="Students" value={students} />
          <Stat label="Staff" value={staff} />
          <Stat label="Info pages" value={content.length} />
        </section>
      ) : null}

      {tab === "users" ? (
        <ul className="mt-5 space-y-2">
          {users.map((u) => {
            const isAdmin = admins.includes(u.id);
            return (
              <li key={u.id} className="card-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.role} - {u.department ?? "no department"}
                      {u.year ? ` - ${u.year}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u.roll_number || u.employee_id || "no identifier"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (isAdmin) await adminService.revokeAdmin(u.id);
                        else await adminService.grantAdmin(u.id);
                        await loadAll();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Role change failed");
                      }
                    }}
                    className={
                      "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold " +
                      (isAdmin
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground")
                    }
                  >
                    {isAdmin ? "Admin" : "Make admin"}
                  </button>
                </div>
              </li>
            );
          })}
          {users.length === 0 ? (
            <li className="text-sm text-muted-foreground">No members yet.</li>
          ) : null}
        </ul>
      ) : null}

      {tab === "content" ? (
        <ContentEditor content={content} reload={loadAll} onError={setError} />
      ) : null}

      {tab === "activity" ? (
        <ul className="mt-5 space-y-2">
          {activity.map((a) => (
            <li key={a.id} className="card-elevated p-3">
              <p className="text-sm font-semibold">
                {a.action} - {a.entity}
              </p>
              {a.detail ? <p className="text-xs text-muted-foreground">{a.detail}</p> : null}
              <p className="text-[11px] text-muted-foreground">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {activity.length === 0 ? (
            <li className="text-sm text-muted-foreground">Nothing logged yet.</li>
          ) : null}
        </ul>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-elevated p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ContentEditor({
  content,
  reload,
  onError,
}: {
  content: SiteContent[];
  reload: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, { title: string; body: string; source_url: string }>>(
    {},
  );

  function draftFor(item: SiteContent) {
    return (
      drafts[item.id] ?? {
        title: item.title,
        body: item.body,
        source_url: item.source_url ?? "",
      }
    );
  }

  return (
    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={async () => {
          try {
            const slug = `note-${Date.now()}`;
            await adminService.createContent({
              slug,
              section: "General",
              title: "New information page",
              body: "Write the official information here.",
              source_url: "https://sietk.org/",
              published: false,
            });
            await reload();
          } catch (err) {
            onError(err instanceof Error ? err.message : "Could not create the page");
          }
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
      >
        <Plus className="size-3.5" aria-hidden /> New information page
      </button>

      {content.map((item) => {
        const d = draftFor(item);
        return (
          <article key={item.id} className="card-elevated space-y-2 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.section} - /{item.slug}
            </p>
            <input
              className="field"
              value={d.title}
              onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, title: e.target.value } })}
            />
            <textarea
              className="field min-h-32"
              value={d.body}
              onChange={(e) => setDrafts({ ...drafts, [item.id]: { ...d, body: e.target.value } })}
            />
            <input
              className="field"
              placeholder="Source URL on sietk.org"
              value={d.source_url}
              onChange={(e) =>
                setDrafts({ ...drafts, [item.id]: { ...d, source_url: e.target.value } })
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await adminService.saveContent(item.id, {
                      title: d.title,
                      body: d.body,
                      source_url: d.source_url || null,
                    });
                    await reload();
                  } catch (err) {
                    onError(err instanceof Error ? err.message : "Save failed");
                  }
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <Save className="size-3.5" aria-hidden /> Save
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminService.saveContent(item.id, { published: !item.published });
                  await reload();
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
              >
                {item.published ? "Published" : "Draft"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminService.deleteContent(item.id);
                  await reload();
                }}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden /> Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
