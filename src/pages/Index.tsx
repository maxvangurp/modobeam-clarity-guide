import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import {
  dismissPreferencesNudge,
  getProfile,
  getStreak,
  isOnboardingComplete,
  MOMENT_LABELS,
  shouldShowPreferencesNudge,
  type MomentNeed,
} from "@/lib/profile";
import { Flame, Layers, Sparkles, X } from "lucide-react";

interface LastReflection {
  id: string;
  draw_type: string;
  cards: { id: string; name: string }[];
  created_at: string;
}

const MOMENT_ORDER: MomentNeed[] = [
  "clarity",
  "calm",
  "direction",
  "uncertain",
  "reflect",
];

// Short, tappable labels — keep them tight for chip layout
const MOMENT_CHIP: Record<MomentNeed, string> = {
  clarity: "Clarity",
  calm: "Calm",
  direction: "Direction",
  uncertain: "Uncertainty",
  reflect: "Just reflecting",
};

const Index = () => {
  const navigate = useNavigate();
  const [showNudge, setShowNudge] = useState(false);
  const [last, setLast] = useState<LastReflection | null>(null);
  const [moment, setMoment] = useState<MomentNeed | null>(null);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      navigate("/welcome", { replace: true });
      return;
    }
    setShowNudge(shouldShowPreferencesNudge());

    // Fetch the most recent reflection for continuity ("Last time you reflected on…")
    (async () => {
      const session_id = getSessionId();
      const { data } = await supabase
        .from("insights")
        .select("id, draw_type, cards, created_at")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setLast(data as unknown as LastReflection);
    })();
  }, [navigate]);

  const profile = getProfile();

  const isReturning = !!last;
  const greeting = useMemo(() => {
    if (profile?.firstName) {
      return isReturning
        ? `Welcome back, ${profile.firstName}.`
        : `Hello, ${profile.firstName}.`;
    }
    return isReturning ? "Welcome back." : "A quiet moment with yourself.";
  }, [profile?.firstName, isReturning]);

  const lastCardName = last?.cards?.[0]?.name?.toLowerCase();

  const startDaily = () => {
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    navigate(`/draw/daily${params.toString() ? `?${params}` : ""}`);
  };

  const startThree = () => {
    const params = new URLSearchParams();
    if (moment) params.set("moment", moment);
    navigate(`/draw/three${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <AppShell>
      {showNudge && (
        <section className="mt-2 mb-4 rounded-2xl bg-card/60 backdrop-blur border border-border/50 px-5 py-4 flex items-start gap-3 animate-fade-up">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-foreground/90 leading-relaxed">
              Has something changed in how you want to use Modobeam?
            </p>
            <Link
              to="/preferences"
              onClick={() => {
                dismissPreferencesNudge();
                setShowNudge(false);
              }}
              className="inline-block mt-1.5 text-[12px] uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-smooth"
            >
              Update preferences →
            </Link>
          </div>
          <button
            onClick={() => {
              dismissPreferencesNudge();
              setShowNudge(false);
            }}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground transition-smooth -mr-1 -mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* 1. Welcome + continuity */}
      <section className="pt-6 pb-8 animate-fade-up">
        <p className="text-sm text-muted-foreground tracking-wide">
          {greeting}
        </p>
        <h1 className="font-display text-[2rem] leading-[1.1] font-light tracking-tight text-foreground mt-2">
          Take a breath.
          <br />
          <span className="font-medium italic">Begin</span> when you're ready.
        </h1>
        {lastCardName && (
          <p className="text-[13px] text-muted-foreground mt-4 leading-relaxed">
            Last time you reflected on{" "}
            <span className="text-foreground/80 italic">{lastCardName}</span>.
          </p>
        )}
      </section>

      {/* 2. Moment check-in — light, optional, inline */}
      <section className="animate-fade-up [animation-delay:120ms]">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          What feels closest right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {MOMENT_ORDER.map((id) => {
            const selected = moment === id;
            return (
              <button
                key={id}
                onClick={() => setMoment(selected ? null : id)}
                className={`px-4 py-2 rounded-full text-[13px] border transition-smooth backdrop-blur ${
                  selected
                    ? "bg-foreground text-background border-foreground shadow-soft"
                    : "bg-card/70 text-foreground/80 border-border/60 hover:bg-card hover:text-foreground"
                }`}
              >
                {MOMENT_CHIP[id]}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-2">
          Optional — shapes this reading only.
        </p>
      </section>

      {/* 3. Primary action — one clear CTA */}
      <section className="mt-10 animate-fade-up [animation-delay:240ms]">
        <Button
          size="lg"
          onClick={startDaily}
          className="w-full h-auto py-5 px-6 rounded-2xl bg-gradient-button text-primary-foreground hover:opacity-95 shadow-soft justify-between group"
        >
          <span className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display text-base font-medium">
                {isReturning
                  ? "Continue your reflection"
                  : "Start your daily clarity"}
              </span>
              <span className="block text-xs opacity-70 font-body">
                One card · one focus
              </span>
            </span>
          </span>
          <span className="text-xl opacity-60 group-hover:translate-x-0.5 transition-smooth">
            →
          </span>
        </Button>

        {/* 4. Secondary subtle actions */}
        <div className="mt-5 flex items-center justify-center gap-1 text-[13px]">
          <button
            onClick={startThree}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-smooth px-3 py-2 rounded-full"
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.6} />
            3-card insight
          </button>
          <span className="text-muted-foreground/30">·</span>
          <Link
            to="/history"
            className="text-muted-foreground hover:text-foreground transition-smooth px-3 py-2 rounded-full"
          >
            View your week
          </Link>
        </div>
      </section>

      {/* Quiet link to deeper readings — never competing with the primary CTA */}
      <section className="mt-10 text-center animate-fade-up [animation-delay:360ms]">
        <Link
          to="/readings"
          className="inline-block text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 hover:text-foreground transition-smooth"
        >
          Explore deeper readings
        </Link>
      </section>
    </AppShell>
  );
};

export default Index;
