import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ChoiceCard } from "@/components/onboarding/ChoiceCard";
import {
  BirthDetailsForm,
  type BirthDetails,
} from "@/components/onboarding/BirthDetailsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GUIDANCE_LABELS,
  LOOKING_FOR_LABELS,
  RHYTHM_LABELS,
  USAGE_LABELS,
  markOnboardingComplete,
  saveProfile,
  type GuidanceStyle,
  type LookingFor,
  type Rhythm,
  type UsageMode,
} from "@/lib/profile";

const TOTAL_STEPS = 6;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [usage, setUsage] = useState<UsageMode | null>(null);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null);
  const [guidance, setGuidance] = useState<GuidanceStyle | null>(null);
  const [rhythm, setRhythm] = useState<Rhythm | null>(null);
  const [firstName, setFirstName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [birth, setBirth] = useState<BirthDetails>({
    birthTime: null,
    birthPlace: null,
    birthLat: null,
    birthLon: null,
    birthTzOffsetMin: null,
  });

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const finish = () => {
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
    });
    markOnboardingComplete();
    // Send them straight into a soft first check-in
    navigate("/draw/daily?from=onboarding");
  };

  const canContinue =
    (step === 1 && !!usage) ||
    (step === 2 && !!lookingFor) ||
    (step === 3 && !!guidance) ||
    (step === 4 && !!rhythm) ||
    step === 5 ||
    step === 6;

  return (
    <OnboardingShell
      step={step}
      total={TOTAL_STEPS}
      onBack={step > 1 ? back : undefined}
    >
      <div key={step} className="flex-1 flex flex-col animate-fade-up">
        {step === 1 && (
          <Step
            kicker="Welcome"
            title="How would you like to use Modobeam?"
            hint="Choose what feels closest. You can always shift later."
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
          </Step>
        )}

        {step === 2 && (
          <Step
            kicker="A small intention"
            title="What are you usually looking for in a reflection moment?"
            hint="Pick the one that fits most often."
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
          </Step>
        )}

        {step === 3 && (
          <Step
            kicker="Your tone"
            title="What kind of guidance feels right to you?"
            hint="This shapes how Modobeam writes for you."
          >
            <div className="grid gap-2.5">
              <ChoiceCard
                label="Direct and honest"
                description="Plain language. No softening."
                selected={guidance === "direct"}
                onClick={() => setGuidance("direct")}
              />
              <ChoiceCard
                label="Calm and supportive"
                description="Grounded, gentle, encouraging."
                selected={guidance === "calm"}
                onClick={() => setGuidance("calm")}
              />
              <ChoiceCard
                label="Deep and reflective"
                description="More poetic. Asks more of you."
                selected={guidance === "deep"}
                onClick={() => setGuidance("deep")}
              />
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step
            kicker="Your rhythm"
            title="How often would you like to check in?"
            hint="No pressure — this just helps shape gentle nudges later."
          >
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
          </Step>
        )}

        {step === 5 && (
          <Step
            kicker="Almost there"
            title="Let's make this feel a little more personal."
            hint="Skip anything you'd rather not share."
          >
            <div className="grid gap-4 mt-2">
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
            <p className="text-[12px] text-muted-foreground mt-5 leading-relaxed">
              Modobeam doesn't predict the future. It helps you notice what
              you already know.
            </p>
          </Step>
        )}

        {step === 6 && (
          <Step
            kicker="A soft lens · optional"
            title="A quiet astrological layer, if you'd like."
            hint="Modobeam can use a gentle astrological lens to add a little more depth — never to predict, never to define you. Skip if it's not for you."
          >
            <BirthDetailsForm
              value={{
                birthday: birthday || undefined,
                birthTime: birth.birthTime,
                birthPlace: birth.birthPlace,
                birthLat: birth.birthLat,
                birthLon: birth.birthLon,
                birthTzOffsetMin: birth.birthTzOffsetMin,
              }}
              onChange={(next) => {
                if (typeof next.birthday === "string") setBirthday(next.birthday);
                setBirth({
                  birthTime: next.birthTime ?? null,
                  birthPlace: next.birthPlace ?? null,
                  birthLat: next.birthLat ?? null,
                  birthLon: next.birthLon ?? null,
                  birthTzOffsetMin: next.birthTzOffsetMin ?? null,
                });
              }}
            />

            <div className="mt-7 rounded-3xl bg-card/60 backdrop-blur border border-border/50 p-5 space-y-3">
              {usage && <Summary label="Use" value={USAGE_LABELS[usage]} />}
              {lookingFor && (
                <Summary label="Looking for" value={LOOKING_FOR_LABELS[lookingFor]} />
              )}
              {guidance && (
                <Summary label="Tone" value={GUIDANCE_LABELS[guidance]} />
              )}
              {rhythm && (
                <Summary label="Rhythm" value={RHYTHM_LABELS[rhythm]} />
              )}
            </div>
          </Step>
        )}

        <div className="mt-auto pt-8">
          {step < TOTAL_STEPS ? (
            <Button
              size="lg"
              onClick={next}
              disabled={!canContinue}
              className="w-full rounded-full bg-gradient-button text-primary-foreground h-14 text-base shadow-soft disabled:opacity-40"
            >
              Continue
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={finish}
              className="w-full rounded-full bg-gradient-button text-primary-foreground h-14 text-base shadow-soft"
            >
              Begin with a simple check-in
            </Button>
          )}
          {(step === 5 || step === 6) && (
            <button
              onClick={finish}
              className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-smooth mt-3"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
};

const Step = ({
  kicker,
  title,
  hint,
  children,
}: {
  kicker: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <>
    <div className="mb-7">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
        {kicker}
      </p>
      <h1 className="font-display text-[1.75rem] leading-[1.15] font-light tracking-tight text-foreground">
        {title}
      </h1>
      {hint && (
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
    {children}
  </>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </span>
    <span className="font-display text-[14px] text-foreground text-right">
      {value}
    </span>
  </div>
);

export default Onboarding;
