import { cn } from "@/lib/utils";

interface ModobeamLogoProps {
  className?: string;
  descriptor?: string;
}

export const ModobeamLogo = ({
  className,
  descriptor,
}: ModobeamLogoProps) => (
  <div className={cn("inline-flex min-w-0 items-center gap-3.5", className)}>
    <div className="relative h-9 w-9 shrink-0">
      <div className="absolute inset-[-2px] rounded-full bg-primary/12 blur-md" />
      <div className="absolute inset-0 rounded-full bg-gradient-mark shadow-mark" />
      <div className="absolute inset-[1.5px] rounded-full border border-background/25" />
      <div className="absolute inset-[6.5px] rounded-full border border-border/60 bg-background/82 backdrop-blur-sm" />
      <div className="absolute left-1/2 top-[7px] h-[14px] w-[4px] -translate-x-1/2 rounded-full bg-gradient-to-b from-beam-soft via-primary to-primary/55 shadow-glow" />
      <div className="absolute inset-x-[8px] top-1/2 h-px -translate-y-1/2 bg-border/60" />
      <div className="absolute right-[6px] top-[8px] h-[4.5px] w-[4.5px] rounded-full bg-beam-soft/90" />
      <div className="absolute inset-0 rounded-full bg-gradient-beam animate-beam opacity-80" />
    </div>

    <div className="flex min-w-0 flex-col justify-center leading-none">
      <span className="truncate font-display text-[1.12rem] font-semibold tracking-[0.01em] text-foreground">
        Modo<span className="font-light text-foreground/72">beam</span>
      </span>
      {descriptor ? (
        <span className="mt-1.5 pl-px font-display text-[0.66rem] font-medium uppercase tracking-[0.12em] text-muted-foreground/78">
          {descriptor}
        </span>
      ) : null}
    </div>
  </div>
);
