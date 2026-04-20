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
  created_at: string;
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const History = () => {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const session_id = getSessionId();
      const { data } = await supabase
        .from("insights")
        .select("id,intention,draw_type,cards,created_at")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false });
      setRows((data as unknown as Row[]) ?? []);
    })();
  }, []);

  return (
    <AppShell>
      <section className="pt-6 pb-8 animate-fade-up">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Looking back
        </p>
        <h1 className="font-display text-3xl font-light">Your history</h1>
      </section>

      {rows === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-card/50 animate-pulse"
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
        <ul className="space-y-3 animate-fade-up [animation-delay:80ms]">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                to={`/insight/${r.id}`}
                className="group block rounded-2xl bg-card/70 backdrop-blur border border-border/60 p-5 shadow-soft hover:shadow-card transition-smooth"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {r.draw_type === "three" ? "3-card" : "Daily"}
                  </span>
                  <time className="text-[11px] text-muted-foreground tabular-nums">
                    {fmt(r.created_at)}
                  </time>
                </div>
                <p className="font-display text-base font-medium text-foreground mb-1">
                  {r.cards.map((c) => c.name).join("  ·  ")}
                </p>
                {r.intention && (
                  <p className="text-sm text-muted-foreground italic line-clamp-1">
                    "{r.intention}"
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
};

export default History;
