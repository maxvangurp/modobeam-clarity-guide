import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Sparkles } from "lucide-react";

interface Row {
  id: string;
  intention: string | null;
  draw_type: "daily" | "three";
  cards: { id: string; name: string }[];
  combined_insight: string | null;
  created_at: string;
}

/* ── time grouping helpers ── */

function getGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  if (d >= startOfToday) return "Today";
  if (d >= startOfYesterday) return "Yesterday";
  if (d >= startOfWeek) return "This week";
  return "Older";
}

const GROUP_ORDER = ["Today", "Yesterday", "This week", "Older"];

function groupRows(rows: Row[]): { label: string; items: Row[] }[] {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const g = getGroup(r.created_at);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(r);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
    label: g,
    items: map.get(g)!,
  }));
}

/* ── insight preview extractor ── */

function getPreview(row: Row): string | null {
  if (!row.combined_insight) return null;
  try {
    const parsed = JSON.parse(row.combined_insight);
    // prefer theme (short, punchy), fall back to combined
    return parsed.theme || parsed.combined || null;
  } catch {
    // legacy plain-text
    return row.combined_insight;
  }
}

function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── category dot color ── */

const categoryDot: Record<string, string> = {
  daily: "bg-beam/60",
  three: "bg-accent/70",
};

const History = () => {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const session_id = getSessionId();
      const { data } = await supabase
        .from("insights")
        .select("id,intention,draw_type,cards,combined_insight,created_at")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false });
      setRows((data as unknown as Row[]) ?? []);
    })();
  }, []);

  const groups = rows ? groupRows(rows) : null;

  return (
    <AppShell>
      <section className="pt-6 pb-6 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Looking back
        </p>
        <h1 className="font-display text-3xl font-light">Your reflections</h1>
      </section>

      {rows === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-card/50 animate-pulse"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl bg-card/60 backdrop-blur border border-border/60 p-8 text-center animate-fade-up">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-beam-soft to-beam mx-auto mb-4 shadow-glow" />
          <h2 className="font-display text-lg mb-1">Nothing here yet</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Your past insights will live here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            <Sparkles className="h-4 w-4" /> Draw your first card
          </Link>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-up [animation-delay:80ms]">
          {groups!.map((group) => (
            <section key={group.label}>
              {/* Group header */}
              <h2 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3 pl-1">
                {group.label}
              </h2>

              <ul className="space-y-2.5">
                {group.items.map((r) => {
                  const isThree = r.draw_type === "three";
                  const preview = getPreview(r);

                  return (
                    <li key={r.id}>
                      <Link
                        to={`/insight/${r.id}`}
                        className="group block rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-soft hover:shadow-card transition-smooth overflow-hidden"
                      >
                        <div className={isThree ? "p-5" : "px-5 py-4"}>
                          {/* Top row: type badge + time */}
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${categoryDot[r.draw_type] ?? "bg-muted-foreground"}`}
                              />
                              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                                {isThree ? "3-card reading" : "Daily card"}
                              </span>
                            </div>
                            <time className="text-[10px] text-muted-foreground/70 tabular-nums">
                              {fmtTime(r.created_at)}
                            </time>
                          </div>

                          {/* Card names */}
                          <p
                            className={`font-display font-medium text-foreground mb-1 ${
                              isThree ? "text-[17px]" : "text-[15px]"
                            }`}
                          >
                            {r.cards.map((c) => c.name).join("  ·  ")}
                          </p>

                          {/* Insight preview */}
                          {preview && (
                            <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-1 mt-1">
                              {preview}
                            </p>
                          )}

                          {/* Intention (subtle) */}
                          {r.intention && !preview && (
                            <p className="text-[13px] text-muted-foreground/60 italic line-clamp-1 mt-1">
                              "{r.intention}"
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default History;
