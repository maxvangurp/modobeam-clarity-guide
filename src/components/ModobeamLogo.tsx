import { cn } from "@/lib/utils";

export const ModobeamLogo = ({ className }: { className?: string }) => (
  <div className={cn("inline-flex items-center gap-2.5", className)}>
    <div className="relative h-8 w-8 shrink-0">
      <div className="absolute inset-[-2px] rounded-full bg-primary/12 blur-md" />
      <div className="absolute inset-0 rounded-full bg-gradient-mark shadow-mark" />
      <div className="absolute inset-[1.5px] rounded-full border border-background/25" />
      <div className="absolute inset-[6.5px] rounded-full border border-border/60 bg-background/82 backdrop-blur-sm" />
      <div className="absolute left-1/2 top-[7px] h-[14px] w-[4px] -translate-x-1/2 rounded-full bg-gradient-to-b from-beam-soft via-primary to-primary/55 shadow-glow" />
      <div className="absolute inset-x-[8px] top-1/2 h-px -translate-y-1/2 bg-border/60" />
      <div className="absolute right-[6px] top-[8px] h-[4.5px] w-[4.5px] rounded-full bg-beam-soft/90" />
      <div className="absolute inset-0 rounded-full bg-gradient-beam animate-beam opacity-80" />
    </div>
    <span className="font-display text-[1.05rem] font-semibold tracking-[0.01em] text-foreground">
      Modo<span className="font-light text-foreground/72">beam</span>
    </span>
  </div>
);
