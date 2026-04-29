import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ChoiceCard } from "@/components/onboarding/ChoiceCard";
import {
  BirthDetailsForm,
  type BirthDetails,
} from "@/components/onboarding/BirthDetailsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Constellation } from "@/components/Constellation";
import { ArrowRight, Clock3, Sparkles, Waypoints, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  GUIDANCE_LABELS,
  LOOKING_FOR_LABELS,
  RHYTHM_LABELS,
  USAGE_LABELS,
  getProfile,
  saveProfile,
  type GuidanceStyle,
  type LookingFor,
  type Rhythm,
  type UsageMode,
} from "@/lib/profile";
import { fetchRecentInsights, type InsightLite } from "@/lib/progression";
import { readKnowYou, shouldRegenerate, writeKnowYou } from "@/lib/aiKnowYou";
import { supabase } from "@/integrations/supabase/client";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";

const Preferences = () => {
  const navigate = useNavigate();
  const existing = getProfile() ?? {};

  const [usage, setUsage] = useState<UsageMode | null>(existing.usage ?? null);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(
    existing.lookingFor ?? null,
  );
  const [guidance, setGuidance] = useState<GuidanceStyle | null>(
    existing.guidance ?? null,
  );
  const [rhythm, setRhythm] = useState<Rhythm | null>(existing.rhythm ?? null);
  const [firstName, setFirstName] = useState(existing.firstName ?? "");
  const [birthday, setBirthday] = useState(existing.birthday ?? "");
  const [astroEnabled, setAstroEnabled] = useState<boolean>(
    existing.astroLensEnabled !== false,
  );
  const [birth, setBirth] = useState<BirthDetails>({
    birthTime: existing.birthTime ?? null,
    birthPlace: existing.birthPlace ?? null,
    birthLat: existing.birthLat ?? null,
    birthLon: existing.birthLon ?? null,
    birthTzOffsetMin: existing.birthTzOffsetMin ?? null,
  });

  const [insights, setInsights] = useState<InsightLite[]>([]);
  const [knowYouText, setKnowYouText] = useState<string>(
    () => readKnowYou()?.text ?? "",
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const recent = await fetchRecentInsights(60);
      if (cancelled) return;
      setInsights(recent);

      // Refresh the AI's "how I'm starting to know you" note every ~10 reflections.
      if (shouldRegenerate(recent.length)) {
        try {
          const reflections = recent.slice(0, 20).map((r) => {
            const parsed = parseCombined(r.combined_insight);
            return {
              date: r.created_at,
              draw_type: r.draw_type,
              cards: r.cards.map((c) => c.name),
              theme: parsed.theme ?? "",
              tension: parsed.tension ?? "",
            };
          });
          const { data, error } = await supabase.functions.invoke("know-you", {
            body: { reflections, firstName: existing.firstName ?? null },
          });
          if (!error) {
            const note = (data as { note?: string })?.note?.trim() ?? "";
            if (note) {
              writeKnowYou({
                text: note,
                generatedAtCount: recent.length,
                generatedAt: new Date().toISOString(),
              });
              setKnowYouText(note);
            }
          }
        } catch {
          /* silent — note is a quiet bonus */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    saveProfile({
      usage: usage ?? undefined,
      lookingFor: lookingFor ?? undefined,
      guidance: guidance ?? undefined,
      rhythm: rhythm ?? undefined,
      firstName: firstName.trim() || undefined,
      birthday: birthday || undefined,
      birthTime: birth.birthTime ?? null,
      birthPlace: birth.birthPlace ?? null,
      birthLat: birth.birthLat ?? null,
      birthLon: birth.birthLon ?? null,
      birthTzOffsetMin: birth.birthTzOffsetMin ?? null,
      astroLensEnabled: astroEnabled,
    });
    toast.success("Preferences updated");
    navigate("/");
  };

  return (
    <AppShell showBack backTo="/">
      <section className={cn(layout.pageHeader, layout.pageSection)}>
        <div className={layout.pageIntro}>
          <p className={layout.eyebrow}>Preferences</p>
          <h1 className={layout.title}>
            How Modobeam fits you.
          </h1>
          <p className={layout.body}>
            Adjust anything, anytime. These shape the baseline tone — your
            moment-of choices still come first.
          </p>
        </div>
      </section>

      {/* Constellation — long-arc portrait of presence over time */}
      {insights.length >= 3 && (
        <section className="mb-2 animate-fade-up">
          <div className="rounded-3xl bg-card/50 backdrop-blur border border-border/50 px-5 pt-5 pb-3 shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Your field of presence
            </p>
            <Constellation insights={insights} className="mt-2 -mx-1" />
            <p className="text-[11px] text-muted-foreground/70 mt-1 italic">
              {insights.length} {insights.length === 1 ? "moment" : "moments"} —
              gently arranged.
            </p>
          </div>
        </section>
      )}

      {/* "How I'm starting to know you" — quiet AI-observed note */}
      {knowYouText && (
        <section className="mb-2 animate-fade-up">
          <div className="rounded-3xl bg-gradient-dawn border border-border/50 px-5 py-4 shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.25em] text-ink-soft/80 mb-2">
              How I'm starting to know you
            </p>
            <p className="text-[14px] leading-relaxed text-foreground/90 italic">
              {knowYouText}
            </p>
          </div>
        </section>
      )}

      <Section kicker="Reflection insights" title="Pattern memory and deeper views">
        <div className="space-y-3">
          <InsightLink
            to="/insights/weekly"
            label="Weekly overview"
            description="Open your weekly snapshot, rhythm, and returning themes."
            icon={Sparkles}
          />
          <ComingSoonRow
            label="Monthly overview"
            description="A wider pattern view across the last month."
            icon={Clock3}
          />
          <ComingSoonRow
            label="Pattern history"
            description="Trace recurring themes and tones across your reflection history."
            icon={Waypoints}
          />
          <div className="rounded-[1.15rem] border border-border/60 bg-card/70 px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/58">
              Reflection preferences
            </p>
            <p className="mt-2 text-[13px] leading-[1.62] text-muted-foreground/92">
              Tone, rhythm, and guidance settings live below so your weekly insights connect back to how Modobeam speaks to you.
            </p>
          </div>
        </div>
      </Section>

      <Section
        kicker="How you use it"
        title="What brings you here, generally?"
      >
        <div className="grid gap-2.5">
          {(Object.keys(USAGE_LABELS) as UsageMode[]).map((id) => (
            <ChoiceCard
              key={id}
              label={USAGE_LABELS[id]}
              selected={usage === id}
              onClick={() => setUsage(id)}
            />
          ))}
        </div>
      </Section>

      <Section
        kicker="What you look for"
        title="Usually, what are you after in a reflection?"
      >
        <div className="grid gap-2.5">
          {(Object.keys(LOOKING_FOR_LABELS) as LookingFor[]).map((id) => (
            <ChoiceCard
              key={id}
              label={LOOKING_FOR_LABELS[id]}
              selected={lookingFor === id}
              onClick={() => setLookingFor(id)}
            />
          ))}
        </div>
      </Section>

      <Section kicker="Tone" title="How should Modobeam speak to you?">
        <div className="grid gap-2.5">
          {(Object.keys(GUIDANCE_LABELS) as GuidanceStyle[]).map((id) => (
            <ChoiceCard
              key={id}
              label={GUIDANCE_LABELS[id]}
              selected={guidance === id}
              onClick={() => setGuidance(id)}
            />
          ))}
        </div>
      </Section>

      <Section kicker="Rhythm" title="How often do you want to check in?">
        <div className="grid gap-2.5">
          {(Object.keys(RHYTHM_LABELS) as Rhythm[]).map((id) => (
            <ChoiceCard
              key={id}
              label={RHYTHM_LABELS[id]}
              selected={rhythm === id}
              onClick={() => setRhythm(id)}
            />
          ))}
        </div>
      </Section>

      <Section kicker="About you" title="Personal details">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label
              htmlFor="firstName"
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              First name
            </label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.slice(0, 40))}
              placeholder="What should we call you?"
              className="rounded-2xl bg-card/70 border-border/60 backdrop-blur h-12 text-base"
            />
          </div>
          <div className="grid gap-1.5">
            <label
              htmlFor="birthday"
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Birthday <span className="lowercase opacity-60">· optional</span>
            </label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="rounded-2xl bg-card/70 border-border/60 backdrop-blur h-12 text-base"
            />
          </div>
        </div>
      </Section>

      <Section
        kicker="A soft lens · optional"
        title="Astrological details"
      >
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 -mt-2">
          A subtle layer that adds nuance to reflections. Never used to
          predict — only to deepen the lens. Skip whatever doesn't fit.
        </p>

        {/* Toggle — turn the lens off without losing what you've entered */}
        <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 px-4 py-3.5 mb-5 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="astro-lens-toggle"
              className="block text-[14px] text-foreground font-medium cursor-pointer"
            >
              Use the astrology lens
            </label>
            <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
              {astroEnabled
                ? "On — your details quietly tint tone and what gets noticed."
                : "Off — your birth details are kept, just not used right now."}
            </p>
          </div>
          <Switch
            id="astro-lens-toggle"
            checked={astroEnabled}
            onCheckedChange={setAstroEnabled}
            aria-label="Toggle astrology lens"
            className="mt-0.5"
          />
        </div>

        <div
          className={
            astroEnabled
              ? ""
              : "opacity-60 pointer-events-none transition-opacity"
          }
          aria-hidden={!astroEnabled}
        >
          <BirthDetailsForm
            hideBirthday
            value={{
              birthday: birthday || undefined,
              birthTime: birth.birthTime,
              birthPlace: birth.birthPlace,
              birthLat: birth.birthLat,
              birthLon: birth.birthLon,
              birthTzOffsetMin: birth.birthTzOffsetMin,
            }}
            onChange={(next) =>
              setBirth({
                birthTime: next.birthTime ?? null,
                birthPlace: next.birthPlace ?? null,
                birthLat: next.birthLat ?? null,
                birthLon: next.birthLon ?? null,
                birthTzOffsetMin: next.birthTzOffsetMin ?? null,
              })
            }
          />
        </div>
      </Section>

      <div className={cn(layout.actionBlock, "mb-4")}>
        <Button
          size="lg"
          onClick={save}
          className="w-full rounded-full bg-gradient-button text-primary-foreground h-14 text-base shadow-soft"
        >
          Save preferences
        </Button>
      </div>
    </AppShell>
  );
};

const Section = ({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className={cn(layout.pageSection, "mt-9") }>
    <div className={layout.pageIntro}>
      <p className={layout.eyebrow}>
        {kicker}
      </p>
      <h2 className="font-display text-[1.1rem] font-light leading-snug text-foreground">
        {title}
      </h2>
    </div>
    {children}
  </section>
);

export default Preferences;

const InsightLink = ({
  to,
  label,
  description,
  icon: Icon,
}: {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) => (
  <Link
    to={to}
    className="group flex w-full items-start justify-between gap-3 rounded-[1.15rem] border border-border/60 bg-card/70 px-4 py-3.5 text-left shadow-soft transition-smooth hover:bg-card/92"
  >
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/84">
        <Icon className="h-4 w-4 text-foreground/74" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/62">{label}</p>
        <p className="mt-1 text-[13px] leading-[1.58] text-foreground/86">{description}</p>
      </div>
    </div>
    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/62 transition-smooth group-hover:text-foreground" strokeWidth={1.8} />
  </Link>
);

const ComingSoonRow = ({
  label,
  description,
  icon: Icon,
}: {
  label: string;
  description: string;
  icon: LucideIcon;
}) => (
  <div
    className="flex w-full items-start justify-between gap-3 rounded-[1.15rem] border border-dashed border-border/56 bg-card/52 px-4 py-3.5 opacity-90"
    aria-label={`${label} — coming soon`}
  >
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/52 bg-background/72">
        <Icon className="h-4 w-4 text-muted-foreground/82" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/58">{label}</p>
        <p className="mt-1 text-[13px] leading-[1.58] text-muted-foreground/92">{description}</p>
      </div>
    </div>
    <span className="mt-0.5 shrink-0 rounded-full border border-border/56 bg-background/72 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/82">
      Soon
    </span>
  </div>
);
