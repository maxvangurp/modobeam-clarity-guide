import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getReadingType } from "@/data/readingTypes";
import { AppShell } from "@/components/AppShell";
import { HistoryRiver } from "@/components/HistoryRiver";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";

/* ── types ── */

interface Row {
  id: string;
  intention: string | null;
  draw_type: string;
  cards: { id: string; name: string }[];
  combined_insight: string | null;
  created_at: string;
}

type Tab = "timeline" | "week" | "month";

/* ── timeline grouping ── */

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

function groupByTimeline(rows: Row[]) {
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

/* ── week/month grouping ── */

function getWeekKey(d: Date): string {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000) + 1;
  const weekNum = Math.ceil(dayOfYear / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

function getWeekLabel(key: string): string {
  const [year, w] = key.split("-W");
  return `Week ${w}, ${year}`;
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function groupByPeriod(
  rows: Row[],
  keyFn: (d: Date) => string,
  labelFn: (k: string) => string,
) {
  const map = new Map<string, Row[]>();
  const order: string[] = [];
  for (const r of rows) {
    const k = keyFn(new Date(r.created_at));
    if (!map.has(k)) {
      map.set(k, []);
      order.push(k);
    }
    map.get(k)!.push(r);
  }
  return order.map((k) => ({
    key: k,
    label: labelFn(k),
    items: map.get(k)!,
  }));
}

/* ── helpers ── */

function getPreview(row: Row): string | null {
  if (!row.combined_insight) return null;
  try {
    const parsed = JSON.parse(row.combined_insight);
    return parsed.theme || parsed.combined || null;
  } catch {
    return row.combined_insight;
  }
}

function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

function topCards(rows: Row[], n = 3): { name: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const r of rows) {
    for (const c of r.cards) {
      freq.set(c.name, (freq.get(c.name) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

const categoryDot: Record<string, string> = {
  daily: "bg-beam/60",
  three: "bg-accent/70",
};

// First card's category drives a quiet accent dot on each timeline entry
import { getCardById } from "@/data/deck";
import { getCategoryAccent } from "@/lib/categoryAccent";

function rowAccentHsl(r: Row): string {
  const first = r.cards?.[0];
  const card = first ? getCardById(first.id) : null;
  const accent = getCategoryAccent(card?.category);
  return accent.hsl;
}

/* ── AI summary cache + fetcher ── */

interface PeriodSummary {
  summary: string;
  themes: string[];
  corePattern: string;
}

const summaryCache = new Map<string, PeriodSummary>();

/* ── Components ── */

const EmptyState = () => (
  <div className="rounded-3xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur animate-fade-up">
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
);

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-24 rounded-2xl bg-card/50 animate-pulse" />
    ))}
  </div>
);

/* ── Timeline Entry ── */

const TimelineEntry = ({ r }: { r: Row }) => {
  const reading = getReadingType(r.draw_type);
  const isMulti = (reading?.cardCount ?? 1) > 1;
  const preview = getPreview(r);
  const accentHsl = rowAccentHsl(r);
  return (
    <li>
      <Link
        to={`/insight/${r.id}`}
        state={{ back: "/history" }}
        className="group block rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-soft hover:shadow-card transition-smooth overflow-hidden"
        style={{
          borderLeft: `2px solid hsl(${accentHsl} / 0.35)`,
        }}
      >
        <div className={isMulti ? "p-5" : "px-5 py-4"}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `hsl(${accentHsl})` }}
              />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {reading?.label ?? r.draw_type}
              </span>
            </div>
            <time className="text-[10px] text-muted-foreground/70 tabular-nums">
              {fmtTime(r.created_at)}
            </time>
          </div>
          <p
            className={`font-display font-medium text-foreground mb-1 ${isMulti ? "text-[17px]" : "text-[15px]"}`}
          >
            {r.cards.map((c) => c.name).join("  ·  ")}
          </p>
          {preview && (
            <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-1 mt-1">
              {preview}
            </p>
          )}
          {r.intention && !preview && (
            <p className="text-[13px] text-muted-foreground/60 italic line-clamp-1 mt-1">
              "{r.intention}"
            </p>
          )}
        </div>
      </Link>
    </li>
  );
};

/* ── Timeline View ── */

const TimelineView = ({ rows }: { rows: Row[] }) => {
  const groups = groupByTimeline(rows);
  // River expects InsightLite-shaped data; Row already matches enough.
  const riverInsights = rows.map((r) => ({
    id: r.id,
    draw_type: r.draw_type,
    cards: r.cards,
    combined_insight: r.combined_insight,
    created_at: r.created_at,
  }));
  return (
    <div className="space-y-8 animate-fade-up">
      {rows.length >= 2 && (
        <section className="rounded-3xl border border-border/40 bg-card/50 px-5 py-5 shadow-soft backdrop-blur">
          <p className="mb-3 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Your river so far
          </p>
          <HistoryRiver insights={riverInsights} />
        </section>
      )}
      {groups.map((group) => (
        <section key={group.label}>
          <h2 className={layout.eyebrow}>
            {group.label}
          </h2>
          <ul className="mt-3 space-y-3">
            {group.items.map((r) => (
              <TimelineEntry key={r.id} r={r} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

/* ── Period Summary Card ── */

const PeriodSummaryCard = ({
  periodKey,
  period,
  items,
  autoFetch = false,
}: {
  periodKey: string;
  period: "week" | "month";
  items: Row[];
  /** Only auto-fetch for the most recent period; older ones require a tap. */
  autoFetch?: boolean;
}) => {
  const [summary, setSummary] = useState<PeriodSummary | null>(
    summaryCache.get(periodKey) ?? null,
  );
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (summary || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-period", {
        body: {
          period,
          readings: items.map((r) => ({
            draw_type: r.draw_type,
            cards: r.cards,
            combined_insight: r.combined_insight,
            created_at: r.created_at,
          })),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const result: PeriodSummary = {
        summary: (data as any).summary ?? "",
        themes: (data as any).themes ?? [],
        corePattern: (data as any).corePattern ?? "",
      };
      summaryCache.set(periodKey, result);
      setSummary(result);
    } catch (e: any) {
      console.error(e);
      toast.error("Couldn't generate summary");
    } finally {
      setLoading(false);
    }
  }, [periodKey, period, items, summary, loading]);

  // Only auto-fetch for the most recent period — older periods wait for a tap
  // so we don't fire many simultaneous AI calls when the user first opens History.
  useEffect(() => {
    if (autoFetch && !summary && !loading) fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const top = topCards(items);

  return (
    <div className="space-y-3">
      {/* AI summary */}
      {!summary && !loading && (
        <button
          type="button"
          onClick={fetchSummary}
          className="w-full rounded-2xl bg-card/50 border border-border/40 px-5 py-3.5 text-left transition-smooth hover:bg-card/70 hover:border-border/60"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Reflect on this period
          </p>
          <p className="mt-0.5 text-[13px] text-foreground/70">
            Tap to generate insights ↗
          </p>
        </button>
      )}
      {loading && !summary && (
        <div className="rounded-2xl bg-card/60 border border-border/40 p-5 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">Reflecting on this period…</p>
        </div>
      )}

      {summary && (
        <div className="rounded-2xl bg-gradient-dawn border border-border/40 p-5 shadow-soft space-y-3">
          {summary.corePattern && (
            <p className="font-display text-[15px] font-medium text-foreground">
              {summary.corePattern}
            </p>
          )}
          {summary.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {summary.themes.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-background/60 text-muted-foreground border border-border/40"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {summary.summary && (
            <p className="text-[14px] leading-relaxed text-foreground/85">
              {summary.summary}
            </p>
          )}
        </div>
      )}

      {/* Top cards */}
      {top.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            Most drawn
          </span>
          <div className="flex gap-1.5">
            {top.map(({ name, count }) => (
              <span
                key={name}
                className="text-[11px] text-muted-foreground bg-card/60 border border-border/30 rounded-full px-2.5 py-0.5"
              >
                {name}
                {count > 1 && (
                  <span className="text-muted-foreground/50 ml-1">×{count}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Week View ── */

const WeekView = ({ rows }: { rows: Row[] }) => {
  const weeks = useMemo(
    () => groupByPeriod(rows, getWeekKey, getWeekLabel),
    [rows],
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {weeks.map((week, idx) => (
        <section key={week.key}>
          <h2 className={layout.eyebrow}>
            {week.label}
          </h2>

          <PeriodSummaryCard
            periodKey={week.key}
            period="week"
            items={week.items}
            autoFetch={idx === 0}
          />

          {/* Mini daily overview */}
          <ul className="mt-4 space-y-1.5">
            {week.items.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/insight/${r.id}`}
                  state={{ back: "/history" }}
                  className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-xl hover:bg-card/50 transition-smooth group"
                >
                  <span
                    className={`h-1 w-1 rounded-full ${categoryDot[r.draw_type] ?? "bg-muted-foreground"}`}
                  />
                  <span className="text-[12px] text-muted-foreground/60 tabular-nums w-10 shrink-0">
                    {fmtDay(r.created_at)}
                  </span>
                  <span className="text-[13px] text-foreground/80 group-hover:text-foreground transition-smooth truncate">
                    {r.cards.map((c) => c.name).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

/* ── Month View ── */

const MonthView = ({ rows }: { rows: Row[] }) => {
  const months = useMemo(
    () => groupByPeriod(rows, getMonthKey, getMonthLabel),
    [rows],
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {months.map((month, idx) => {
        // Category frequency
        const catFreq = new Map<string, number>();
        for (const r of month.items) {
          // We don't have category stored in cards ref, but we can use draw_type
          catFreq.set(r.draw_type, (catFreq.get(r.draw_type) ?? 0) + 1);
        }
        const top = topCards(month.items, 1);

        return (
          <section key={month.key}>
            <div className={cn(layout.splitHeader, "mb-3")}>
              <h2 className={layout.eyebrow}>
                {month.label}
              </h2>
              <span className="text-[10px] text-muted-foreground/50">
                {month.items.length} reading{month.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <PeriodSummaryCard
              periodKey={month.key}
              period="month"
              items={month.items}
              autoFetch={idx === 0}
            />

            {/* Stats row */}
            <div className="mt-3 flex items-center gap-4 px-1">
              {top.length > 0 && (
                <div className="text-[11px] text-muted-foreground/60">
                  Most drawn:{" "}
                  <span className="text-muted-foreground">{top[0].name}</span>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground/60">
                {catFreq.get("three") ?? 0} deep · {catFreq.get("daily") ?? 0}{" "}
                daily
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

/* ── Main ── */

const TABS: { key: Tab; label: string }[] = [
  { key: "timeline", label: "Timeline" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const History = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [tab, setTab] = useState<Tab>("timeline");

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

  return (
    <AppShell screenMood="history">
      <section className="animate-fade-up pt-2 pb-6">
        <div className={layout.pageIntro}>
        <p className={layout.eyebrow}>
          Looking back
        </p>
        <h1 className={layout.title}>Your reflections</h1>
        </div>
      </section>

      {/* Tabs */}
      {rows && rows.length > 0 && (
        <nav className="mb-8 flex gap-1 rounded-xl border border-border/40 bg-card/50 p-1 animate-fade-up [animation-delay:60ms]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-[12px] uppercase tracking-[0.15em] font-medium rounded-lg transition-smooth ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}

      {/* Content */}
      {rows === null ? (
        <LoadingSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div key={tab}>
          {tab === "timeline" && <TimelineView rows={rows} />}
          {tab === "week" && <WeekView rows={rows} />}
          {tab === "month" && <MonthView rows={rows} />}
        </div>
      )}
    </AppShell>
  );
};

export default History;
