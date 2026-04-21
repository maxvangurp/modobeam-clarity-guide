import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { X, Download, Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getMomentTint } from "@/lib/momentTint";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import type { MomentNeed } from "@/lib/profile";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
  moment: MomentNeed | null;
}

/**
 * "Keep this" — a square shareable card rendered from the AI summary.
 * The user can save it to their photos. No social graph needed.
 */
export const KeepThisCard = ({ open, onOpenChange, summary, moment }: Props) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const tint = getMomentTint(moment);

  // Reset busy state on close
  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  const save = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      haptic("save");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      link.download = `modobeam-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Saved to your downloads");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save just now");
    } finally {
      setBusy(false);
    }
  };

  const bg = tint
    ? `linear-gradient(135deg, hsl(${tint.bg}) 0%, hsl(${tint.hsl} / 0.7) 100%)`
    : `linear-gradient(135deg, hsl(40 30% 97%) 0%, hsl(211 40% 85%) 100%)`;
  const accent = tint ? `hsl(${tint.ring})` : "hsl(218 35% 18%)";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-border/50 max-h-[90vh] overflow-y-auto"
      >
        <div className="max-w-md mx-auto pt-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Keep this
            </p>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* The card itself — exact aspect ratio is square for sharing */}
          <div className="rounded-3xl overflow-hidden shadow-card mx-auto" style={{ width: "min(100%, 340px)" }}>
            <div
              ref={cardRef}
              className="aspect-square p-7 flex flex-col justify-between"
              style={{ background: bg }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: accent }}
                >
                  A moment with myself
                </span>
              </div>

              <p
                className="font-display text-[19px] leading-snug italic"
                style={{ color: "hsl(218 35% 14%)" }}
              >
                "{summary}"
              </p>

              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: accent, opacity: 0.85 }}
                >
                  Modobeam
                </span>
                <span
                  className="text-[10px] tabular-nums"
                  style={{ color: accent, opacity: 0.7 }}
                >
                  {new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6 mb-3">
            <button
              onClick={save}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-button text-primary-foreground py-3 text-sm font-medium shadow-soft disabled:opacity-60 transition-smooth"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Save image
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground/70 mb-6">
            Yours to keep.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
