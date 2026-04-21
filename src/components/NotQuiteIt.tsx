import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  originalSummary: string;
  cards: { name: string; keyword: string }[];
  onRevised: (revised: string) => void;
}

/**
 * "That's not quite it →" — gives the user agency to refine the AI mirror.
 * Quiet, single input, one revision. Trust-building, not chat.
 */
export const NotQuiteIt = ({ open, onClose, originalSummary, cards, onRevised }: Props) => {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("reflect-summary", {
        body: {
          journal: `Earlier I wrote about: ${originalSummary}\n\nWhat I actually meant: ${text.trim()}`,
          cards,
        },
      });
      if (error) throw error;
      const revised = (data as { summary?: string })?.summary?.trim() ?? "";
      if (revised) {
        onRevised(revised);
        toast.success("Heard you");
        onClose();
      } else {
        toast.error("Try again");
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't revise just now");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl bg-background/70 backdrop-blur border border-border/50 p-4 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          What did you actually mean?
        </p>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground transition-smooth"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 400))}
        placeholder="A line is enough."
        rows={2}
        className="rounded-xl bg-card/80 border-border/60 text-sm resize-none"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={submit}
          disabled={!text.trim() || busy}
          className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground disabled:opacity-50 transition-smooth"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : null}
          {busy ? "Listening" : "Try again →"}
        </button>
      </div>
    </div>
  );
};
