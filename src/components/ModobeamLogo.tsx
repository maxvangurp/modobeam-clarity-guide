import { cn } from "@/lib/utils";

export const ModobeamLogo = ({ className }: { className?: string }) => (
  <div className={cn("inline-flex items-center gap-2", className)}>
    <div className="relative h-7 w-7">
      <div className="absolute inset-0 rounded-full bg-gradient-button" />
      <div className="absolute inset-[5px] rounded-full bg-gradient-to-br from-beam-soft to-beam opacity-90" />
      <div className="absolute inset-0 rounded-full bg-gradient-beam animate-beam" />
    </div>
    <span className="font-display text-xl font-semibold tracking-tight">
      Modobeam
    </span>
  </div>
);
