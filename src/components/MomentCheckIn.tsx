import { MOMENT_LABELS, type MomentNeed } from "@/lib/profile";

interface Props {
  value: MomentNeed | null;
  onSelect: (m: MomentNeed) => void;
  onSkip: () => void;
}

const ORDER: MomentNeed[] = [
  "clarity",
  "calm",
  "uncertain",
  "direction",
  "reflect",
];

export const MomentCheckIn = ({ value, onSelect, onSkip }: Props) => (
  <div className="animate-fade-up">
    <div className="text-center mb-7">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
        A small moment first
      </p>
      <h1 className="font-display text-[1.75rem] leading-[1.15] font-light tracking-tight text-foreground">
        What feels closest right now?
      </h1>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        Optional — just for this reading.
      </p>
    </div>

    <div className="grid gap-2.5">
      {ORDER.map((id) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`w-full text-left rounded-2xl px-5 py-4 border transition-smooth backdrop-blur ${
              selected
                ? "bg-foreground text-background border-foreground shadow-soft"
                : "bg-card/70 border-border/60 hover:bg-card hover:border-border"
            }`}
          >
            <span className="font-display text-[15px] font-medium leading-snug">
              {MOMENT_LABELS[id]}
            </span>
          </button>
        );
      })}
    </div>

    <button
      onClick={onSkip}
      className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-smooth mt-6"
    >
      Skip — just draw
    </button>
  </div>
);
