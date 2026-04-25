import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { insightMatchesTheme, type InsightLite } from "@/lib/progression";
import { getReadingType } from "@/data/readingTypes";
import { ArrowUpRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: string | null;
  insights: InsightLite[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ThemeReflectionsSheet({
  open,
  onOpenChange,
  theme,
  insights,
}: Props) {
  const matches = theme
    ? insights.filter((i) => insightMatchesTheme(i, theme))
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border/50 bg-background/95 backdrop-blur-xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            A recurring thread
          </p>
          <SheetTitle className="font-display text-2xl font-light italic text-foreground">
            {theme}
          </SheetTitle>
          <SheetDescription className="text-[13px] text-muted-foreground leading-relaxed">
            {matches.length === 0
              ? "Nothing surfaced yet."
              : `Appeared in ${matches.length} of your recent reflection${
                  matches.length === 1 ? "" : "s"
                }. Tap one to return to it.`}
          </SheetDescription>
        </SheetHeader>

        <ul className="mt-6 space-y-2 pb-4">
          {matches.map((m) => {
            const reading = getReadingType(m.draw_type);
            const cardName = m.cards?.[0]?.name ?? "Reflection";
            return (
              <li key={m.id}>
                <Link
                  to={`/insight/${m.id}`}
                  state={{ back: "/" }}
                  onClick={() => onOpenChange(false)}
                  className="group flex items-start gap-3 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-border/70 px-4 py-3 transition-smooth"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {formatDate(m.created_at)}
                      {reading && (
                        <>
                          <span className="text-muted-foreground/40 mx-1.5">
                            ·
                          </span>
                          {reading.label}
                        </>
                      )}
                    </p>
                    <p className="text-[14px] text-foreground/90 mt-0.5 leading-snug italic font-display">
                      {cardName}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-smooth mt-1 shrink-0"
                    strokeWidth={1.6}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
