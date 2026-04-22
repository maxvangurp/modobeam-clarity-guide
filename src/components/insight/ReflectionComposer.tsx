import { useEffect } from "react";
import { Check, Loader2, ListChecks, Mic, PenLine, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import type { ReflectionMode } from "@/lib/reflectionResponses";
import { cn } from "@/lib/utils";

interface Props {
  mode: ReflectionMode;
  onModeChange: (mode: ReflectionMode) => void;
  writeValue: string;
  onWriteChange: (value: string) => void;
  quickChoices: string[];
  quickSelections: string[];
  quickAllowMultiple: boolean;
  onToggleQuickChoice: (choice: string) => void;
  quickNote: string;
  onQuickNoteChange: (value: string) => void;
  voiceValue: string;
  onVoiceChange: (value: string) => void;
  onVoiceAppend: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
  canSave: boolean;
  saving: boolean;
  saved: boolean;
  skipped: boolean;
}

export const ReflectionComposer = ({
  mode,
  onModeChange,
  writeValue,
  onWriteChange,
  quickChoices,
  quickSelections,
  quickAllowMultiple,
  onToggleQuickChoice,
  quickNote,
  onQuickNoteChange,
  voiceValue,
  onVoiceChange,
  onVoiceAppend,
  onSave,
  onSkip,
  canSave,
  saving,
  saved,
  skipped,
}: Props) => {
  const {
    error,
    interimText,
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechToText({ onFinalText: onVoiceAppend });

  useEffect(() => {
    if (mode !== "voice" && isListening) {
      stopListening();
    }
  }, [isListening, mode, stopListening]);

  return (
    <div className="mt-5 rounded-[1.75rem] border border-border/50 bg-card/60 p-3 shadow-soft backdrop-blur">
      <Tabs value={mode} onValueChange={(value) => onModeChange(value as ReflectionMode)}>
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-full border border-border/50 bg-background/65 p-1">
          <TabsTrigger value="write" className="gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium">
            <PenLine className="h-3.5 w-3.5" />
            Write
          </TabsTrigger>
          <TabsTrigger value="quick" className="gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium">
            <ListChecks className="h-3.5 w-3.5" />
            Quick choices
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium">
            <Mic className="h-3.5 w-3.5" />
            Voice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="mt-3">
          <Textarea
            value={writeValue}
            onChange={(e) => onWriteChange(e.target.value)}
            placeholder="Write freely…"
            rows={6}
            className="resize-none rounded-2xl border-border/60 bg-background/75 text-base"
          />
          <p className="mt-3 px-1 text-[12px] leading-relaxed text-muted-foreground">
            A few honest lines is enough. Nothing has to be polished.
          </p>
        </TabsContent>

        <TabsContent value="quick" className="mt-3">
          <div className="rounded-2xl border border-border/40 bg-background/55 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Choose what fits
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {quickAllowMultiple
                ? "Pick one or a few that feel closest right now."
                : "Pick the one response that feels closest right now."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickChoices.map((choice) => {
                const selected = quickSelections.includes(choice);

                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => onToggleQuickChoice(choice)}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-full border px-3.5 py-2 text-left text-[13px] leading-tight transition-smooth",
                      selected
                        ? "border-transparent bg-gradient-button text-primary-foreground shadow-cta"
                        : "border-border/60 bg-card/80 text-foreground/82 hover:border-border hover:bg-card",
                    )}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onModeChange("write")}
              className="mt-4 text-[12px] text-muted-foreground transition-smooth hover:text-foreground"
            >
              Add a few words
            </button>
          </div>

          <Textarea
            value={quickNote}
            onChange={(e) => onQuickNoteChange(e.target.value)}
            placeholder="A little more, if you want…"
            rows={3}
            className="mt-3 resize-none rounded-2xl border-border/60 bg-background/75 text-sm"
          />
        </TabsContent>

        <TabsContent value="voice" className="mt-3">
          <div className="rounded-2xl border border-border/40 bg-background/55 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Speak softly
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Your voice turns into editable text here.
                </p>
              </div>

              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={!isSupported}
                className={cn(
                  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-smooth",
                  isListening
                    ? "border-transparent bg-gradient-button text-primary-foreground shadow-cta animate-soft-glow"
                    : "border-border/60 bg-card/80 text-foreground/82 hover:border-border hover:bg-card",
                  !isSupported && "cursor-not-allowed opacity-50",
                )}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <p className="mt-4 text-[12px] text-muted-foreground">
              {!isSupported
                ? "Voice input isn't available in this browser, but writing is always here."
                : isListening
                  ? "Listening… tap again when you're done."
                  : "Tap the microphone when you'd rather speak than type."}
            </p>

            {interimText && (
              <p className="mt-3 rounded-2xl border border-border/40 bg-card/70 px-3 py-2 text-[13px] italic leading-relaxed text-muted-foreground animate-fade-up">
                {interimText}
              </p>
            )}

            {error && <p className="mt-3 text-[12px] text-muted-foreground">{error}</p>}
          </div>

          <Textarea
            value={voiceValue}
            onChange={(e) => onVoiceChange(e.target.value)}
            placeholder="Your words will appear here…"
            rows={5}
            className="mt-3 resize-none rounded-2xl border-border/60 bg-background/75 text-sm"
          />
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <button
          onClick={onSkip}
          type="button"
          disabled={skipped || saved}
          className="text-sm text-muted-foreground transition-smooth hover:text-foreground disabled:opacity-50"
        >
          Not right now
        </button>

        <Button
          onClick={onSave}
          disabled={!canSave || saving || saved}
          className={cn(
            "rounded-full bg-gradient-button px-6 text-primary-foreground shadow-cta hover:scale-[1.01] active:scale-[0.99] transition-transform",
            saved && "animate-save-glow",
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="mr-1.5 h-4 w-4" /> Saved
            </>
          ) : (
            "Save reflection"
          )}
        </Button>
      </div>
    </div>
  );
};