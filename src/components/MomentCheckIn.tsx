import { MOMENT_LABELS, type MomentNeed } from "@/lib/profile";
import { MOMENT_ORDER } from "@/lib/momentTint";

interface Props {
  value: MomentNeed | null;
  onSelect: (m: MomentNeed) => void;
  onSkip: () => void;
}

const ORDER = MOMENT_ORDER;

export const MomentCheckIn = ({ value, onSelect, onSkip }: Props) => (
  <div className="animate-fade-up">
    <div className="mb-8 space-y-3 text-left">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
        A small moment first
      </p>
      <h1 className="font-display text-[1.75rem] leading-[1.15] font-light tracking-tight text-foreground">
        What feels closest right now?
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
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
      className="mt-5 w-full text-left text-[13px] text-muted-foreground transition-smooth hover:text-foreground"
    >
      Skip — just draw
    </button>
  </div>
);
