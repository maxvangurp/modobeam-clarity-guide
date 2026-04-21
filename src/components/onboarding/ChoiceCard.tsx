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
    className={`w-full text-left rounded-2xl px-5 py-4 border transition-smooth backdrop-blur ${
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
        className={`text-[12px] mt-1 leading-relaxed ${
          selected ? "opacity-70" : "text-muted-foreground"
        }`}
      >
        {description}
      </div>
    )}
  </button>
);
