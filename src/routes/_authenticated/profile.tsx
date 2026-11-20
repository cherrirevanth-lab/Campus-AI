import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your CampusAI profile - sietk" },
      {
        name: "description",
        content:
          "View your CampusAI account details for the sietk campus: role, department, year and campus identifier.",
      },
      { property: "og:title", content: "Your CampusAI profile" },
      { property: "og:description", content: "CampusAI account details for the sietk campus." },
    ],
  }),
  component: ProfilePage,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ProfilePage() {
  const { profile, user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Profile" icon={UserRound} description="Your CampusAI account." />

      <section className="card-elevated p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {(profile?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-display text-base font-semibold">
              {profile?.name ?? (loading ? "Loading..." : "Campus member")}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4">
          <Row label="Identifier" value={profile?.roll_number || profile?.employee_id || "-"} />
          <Row label="Role" value={profile?.role ?? "-"} />
          <Row label="Department" value={profile?.department ?? "-"} />
          <Row label="Year" value={profile?.year ?? "-"} />
        </div>
      </section>

      <section className="card-elevated mt-4 flex gap-3 p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Your role is set at sign-up and can only be changed by a campus administrator. CampusAI
          answers only from officially published institute information.
        </p>
      </section>

      <button
        type="button"
        onClick={async () => {
          await authService.signOut();
          navigate({ to: "/", replace: true });
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
      >
        <LogOut className="size-4" aria-hidden /> Sign out
      </button>
    </div>
  );
}
