import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <header className="mb-5">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="size-5 text-primary" aria-hidden /> : null}
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
      </div>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("card-elevated p-4", className)}>{children}</section>;
}

export function SourceNote({ source }: { source: string }) {
  return (
    <p className="mt-3 text-[11px] text-muted-foreground">
      Source published by the institute: <span className="break-all">{source}</span>
    </p>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="text-sm font-medium text-primary hover:underline">
      {label}
    </Link>
  );
}
