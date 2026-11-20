import { useState } from "react";
import { ImageOff } from "lucide-react";
import planAsset from "@/assets/campus-layout-plan.jpg.asset.json";
import { cn } from "@/lib/utils";

/**
 * Renders the detailed campus layout plan the digital map is traced from.
 * Aspect ratio and orientation are preserved; no cropping or rotation.
 */
export function CampusMap({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = planAsset?.url;

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center",
          className,
        )}
      >
        <ImageOff className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-muted-foreground">Campus layout plan unavailable</p>
      </div>
    );
  }

  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <img
        src={src}
        onError={() => setFailed(true)}
        alt="Detailed sietk campus layout plan showing A, B, C and D blocks, auditorium, central library, hostels, ground, canteen, SISTEK campus and the main gate"
        className="h-auto w-full object-contain"
        loading="lazy"
      />
      <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        Reference campus layout plan - the digital map above is traced from this drawing.
      </figcaption>
    </figure>
  );
}
