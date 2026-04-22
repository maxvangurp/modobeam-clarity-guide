interface Props {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export const ChoiceCard = ({ label, description, selected, onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-2xl border px-5 py-4 text-left backdrop-blur transition-smooth ${
      selected
        ? "bg-foreground text-background border-foreground shadow-soft"
        : "bg-card/70 border-border/60 hover:bg-card hover:border-border"
    }`}
  >
    <div className="font-display text-[15px] font-medium leading-snug">
      {label}
    </div>
    {description && (
      <div
        className={`mt-2 text-[12px] leading-relaxed ${
          selected ? "opacity-70" : "text-muted-foreground"
        }`}
      >
        {description}
      </div>
    )}
  </button>
);
