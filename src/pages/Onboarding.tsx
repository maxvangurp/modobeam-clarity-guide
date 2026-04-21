import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ChoiceCard } from "@/components/onboarding/ChoiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GUIDANCE_LABELS,
  INTENT_LABELS,
  STATE_LABELS,
  markOnboardingComplete,
  saveProfile,
  type ClarityIntent,
  type CurrentState,
  type GuidanceStyle,
} from "@/lib/profile";

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [intent, setIntent] = useState<ClarityIntent | null>(null);
  const [state, setState] = useState<CurrentState | null>(null);
  const [guidance, setGuidance] = useState<GuidanceStyle | null>(null);
  const [firstName, setFirstName] = useState("");
  const [birthday, setBirthday] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const finish = () => {
    saveProfile({
      intent: intent ?? undefined,
      state: state ?? undefined,
      guidance: guidance ?? undefined,
      firstName: firstName.trim() || undefined,
      birthday: birthday || undefined,
    });
    markOnboardingComplete();
    // Send them straight into a personalized first reading
    navigate("/draw/daily?from=onboarding");
  };

  const canContinue =
    (step === 1 && !!intent) ||
    (step === 2 && !!state) ||
    (step === 3 && !!guidance) ||
    step === 4 ||
    step === 5;

  return (
    <OnboardingShell
      step={step}
      total={TOTAL_STEPS}
      onBack={step > 1 ? back : undefined}
    >
      <div key={step} className="flex-1 flex flex-col animate-fade-up">
        {step === 1 && (
          <Step
            kicker="A quiet check-in"
            title="What do you want more clarity on?"
            hint="Choose what feels closest right now."
          >
            <div className="grid gap-2.5">
              {(Object.keys(INTENT_LABELS) as ClarityIntent[]).map((id) => (
                <ChoiceCard
                  key={id}
                  label={INTENT_LABELS[id]}
                  selected={intent === id}
                  onClick={() => setIntent(id)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step
            kicker="Right now"
            title="What feels most true today?"
            hint="There's no wrong answer — pick the one that lands."
          >
            <div className="grid gap-2.5">
              {(Object.keys(STATE_LABELS) as CurrentState[]).map((id) => (
                <ChoiceCard
                  key={id}
                  label={STATE_LABELS[id]}
                  selected={state === id}
                  onClick={() => setState(id)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step
            kicker="Your tone"
            title="How do you prefer to be reflected back to?"
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
            kicker="Almost there"
            title="Let's make this feel a little more personal."
            hint="This helps shape reflections that fit you better. Skip anything you'd rather not share."
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
          </Step>
        )}

        {step === 5 && (
          <Step
            kicker="Ready"
            title={
              firstName.trim()
                ? `Welcome, ${firstName.trim()}.`
                : "You're all set."
            }
            hint="Your first reflection is waiting. Take a breath, then begin."
          >
            <div className="mt-6 rounded-3xl bg-card/60 backdrop-blur border border-border/50 p-5 space-y-3">
              {intent && (
                <Summary label="Focus" value={INTENT_LABELS[intent]} />
              )}
              {state && (
                <Summary label="Right now" value={STATE_LABELS[state]} />
              )}
              {guidance && (
                <Summary label="Tone" value={GUIDANCE_LABELS[guidance]} />
              )}
            </div>
            <p className="text-[12px] text-muted-foreground mt-5 leading-relaxed">
              Modobeam doesn't predict the future. It helps you notice what
              you already know.
            </p>
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
              Begin your first reflection
            </Button>
          )}
          {step === 4 && (
            <button
              onClick={next}
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
