// Modobeam — pre-draw context step
//
// Renders a small, premium-feeling input form before the actual card
// draw, depending on the reading type. Same shell, different fields.
// Stays consistent with AppShell mood + layout tokens.

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";
import {
  HORIZON_LABELS,
  MILESTONE_LABELS,
  RELATIONSHIP_STATUS_LABELS,
  type HorizonRange,
  type MilestoneKind,
  type ReadingContext,
  type RelationshipStatus,
} from "@/lib/readingContext";
import {
  listPeople,
  RELATION_LABELS,
  upsertPerson,
  type Person,
  type PersonRelation,
} from "@/lib/people";
import { getReadingType, type DrawType } from "@/data/readingTypes";
import { getCategoryAccent } from "@/lib/categoryAccent";

interface Props {
  type: DrawType;
  onConfirm: (ctx: ReadingContext) => void;
  onSkip?: () => void;
}

export const ReadingContextStep = ({ type, onConfirm, onSkip }: Props) => {
  const reading = getReadingType(type);
  const accent = getCategoryAccent(reading?.category);

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Header */}
      <header className="space-y-3">
        <p className={layout.eyebrow}>{reading?.label ?? "Reading"}</p>
        <h1 className={layout.titleSm}>
          Set the <span className="italic font-medium">scene</span>.
        </h1>
        <p className={layout.body}>{contextIntro(type)}</p>
      </header>

      <div
        className="rounded-[1.35rem] border bg-card/96 px-5 py-5 shadow-soft"
        style={{
          backgroundImage: `linear-gradient(180deg, hsl(var(--card)) 0%, hsl(${accent.bg} / 0.32) 100%)`,
          borderColor: `hsl(${accent.ring} / 0.22)`,
        }}
      >
        {type === "friend" && <FriendForm onConfirm={onConfirm} />}
        {type === "this-or-that" && <ThisOrThatForm onConfirm={onConfirm} />}
        {type === "horizon" && <HorizonForm onConfirm={onConfirm} />}
        {type === "relationship-future" && (
          <RelationshipFutureForm onConfirm={onConfirm} />
        )}
        {type === "milestone" && <MilestoneForm onConfirm={onConfirm} />}
      </div>

      {onSkip && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80 hover:text-foreground transition-smooth"
          >
            Skip — draw anyway
          </button>
        </div>
      )}
    </div>
  );
};

function contextIntro(type: DrawType): string {
  switch (type) {
    case "friend":
      return "Reflect on someone you're carrying. The reading will speak through your sense of them.";
    case "this-or-that":
      return "Two paths. Hold them up to the light without choosing yet.";
    case "horizon":
      return "Choose the horizon. Not prediction — the shape of what's forming.";
    case "relationship-future":
      return "Choose who this is about and where you stand. The reading meets you there.";
    case "milestone":
      return "Mark the threshold. A short ritual reflection for the moment itself.";
    default:
      return "A small step before the draw.";
  }
}

// ─── People picker (shared) ────────────────────────────────────────

function PeoplePicker({
  value,
  onChange,
}: {
  value: { name: string; relation: PersonRelation; id?: string } | null;
  onChange: (p: { name: string; relation: PersonRelation; id?: string }) => void;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<PersonRelation>("close-friend");

  useEffect(() => {
    setPeople(listPeople());
  }, []);

  const showAddDefault = !value && people.length === 0;
  const showForm = adding || showAddDefault;

  const addNow = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const p = upsertPerson({ name: trimmed, relation });
    setPeople(listPeople());
    setName("");
    setAdding(false);
    onChange({ name: p.name, relation: p.relation, id: p.id });
  };

  return (
    <div className="space-y-3">
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {people.map((p) => {
            const selected = value?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  onChange({ name: p.name, relation: p.relation, id: p.id })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] transition-smooth",
                  selected
                    ? "border-foreground/65 bg-foreground/8 text-foreground"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                  {RELATION_LABELS[p.relation]}
                </span>
              </button>
            );
          })}
          {!showForm && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 bg-background/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Plus className="h-3 w-3" /> Someone new
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div className="space-y-2.5 rounded-2xl border border-border/55 bg-background/72 px-3.5 py-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Add someone
            </p>
            {people.length > 0 && (
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="text-muted-foreground/70 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name (or initial)"
            className="h-9 text-[13px]"
          />
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(RELATION_LABELS) as PersonRelation[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRelation(r)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-smooth",
                  relation === r
                    ? "border-foreground/55 bg-foreground/8 text-foreground"
                    : "border-border/55 text-muted-foreground hover:text-foreground",
                )}
              >
                {RELATION_LABELS[r]}
              </button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addNow}
            disabled={!name.trim()}
            className="w-full"
          >
            Save & select
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Friend ────────────────────────────────────────────────────────

function FriendForm({ onConfirm }: { onConfirm: (c: ReadingContext) => void }) {
  const [person, setPerson] = useState<{
    name: string;
    relation: PersonRelation;
    id?: string;
  } | null>(null);
  const [topic, setTopic] = useState("");

  const ready = !!person?.name;

  return (
    <div className="space-y-5">
      <FieldLabel>Who is this about?</FieldLabel>
      <PeoplePicker value={person} onChange={setPerson} />

      <FieldLabel>What's on your mind about them?  <Quiet>optional</Quiet></FieldLabel>
      <Input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. they've been distant lately"
        className="h-10 text-[13px]"
      />

      <ConfirmButton
        disabled={!ready}
        onClick={() =>
          onConfirm({
            kind: "friend",
            personName: person!.name,
            personRelation: RELATION_LABELS[person!.relation],
            personId: person!.id,
            topic: topic.trim() || undefined,
          })
        }
      />
    </div>
  );
}

// ─── This or that ──────────────────────────────────────────────────

function ThisOrThatForm({
  onConfirm,
}: {
  onConfirm: (c: ReadingContext) => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [q, setQ] = useState("");
  const ready = a.trim() && b.trim();

  return (
    <div className="space-y-5">
      <FieldLabel>The two paths</FieldLabel>
      <div className="space-y-2.5">
        <Input
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="Option A — e.g. take the job"
          className="h-10 text-[13px]"
        />
        <Input
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="Option B — e.g. wait for the right one"
          className="h-10 text-[13px]"
        />
      </div>
      <FieldLabel>What's the question?  <Quiet>optional</Quiet></FieldLabel>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="e.g. should I leave"
        className="h-10 text-[13px]"
      />

      <ConfirmButton
        disabled={!ready}
        onClick={() =>
          onConfirm({
            kind: "this-or-that",
            optionA: a.trim(),
            optionB: b.trim(),
            question: q.trim() || undefined,
          })
        }
      />
    </div>
  );
}

// ─── Horizon ───────────────────────────────────────────────────────

function HorizonForm({
  onConfirm,
}: {
  onConfirm: (c: ReadingContext) => void;
}) {
  const [range, setRange] = useState<HorizonRange>("1-year");
  const [area, setArea] = useState("");

  const ranges: HorizonRange[] = ["3-months", "1-year", "3-years", "5-years"];

  return (
    <div className="space-y-5">
      <FieldLabel>How far out?</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {ranges.map((r) => {
          const selected = r === range;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-2xl border px-3.5 py-3 text-left transition-smooth",
                selected
                  ? "border-foreground/55 bg-foreground/[0.05]"
                  : "border-border/60 bg-background/65 hover:bg-background/90",
              )}
            >
              <p className="font-display text-[14px] font-medium text-foreground">
                {HORIZON_LABELS[r]}
              </p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/85">
                {r === "3-months"
                  ? "Near"
                  : r === "1-year"
                    ? "Forming"
                    : r === "3-years"
                      ? "Arc"
                      : "Long view"}
              </p>
            </button>
          );
        })}
      </div>

      <FieldLabel>Anything specific?  <Quiet>optional</Quiet></FieldLabel>
      <Input
        value={area}
        onChange={(e) => setArea(e.target.value)}
        placeholder="e.g. work, relationships, where I live"
        className="h-10 text-[13px]"
      />

      <ConfirmButton
        onClick={() =>
          onConfirm({
            kind: "horizon",
            range,
            area: area.trim() || undefined,
          })
        }
      />
    </div>
  );
}

// ─── Relationship future ───────────────────────────────────────────

function RelationshipFutureForm({
  onConfirm,
}: {
  onConfirm: (c: ReadingContext) => void;
}) {
  const [person, setPerson] = useState<{
    name: string;
    relation: PersonRelation;
    id?: string;
  } | null>(null);
  const [status, setStatus] = useState<RelationshipStatus>("dating");
  const ready = !!person?.name;
  const statuses = useMemo(
    () =>
      Object.keys(RELATIONSHIP_STATUS_LABELS) as RelationshipStatus[],
    [],
  );

  return (
    <div className="space-y-5">
      <FieldLabel>Who is this about?</FieldLabel>
      <PeoplePicker value={person} onChange={setPerson} />

      <FieldLabel>Where do you stand?</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11.5px] transition-smooth",
              status === s
                ? "border-foreground/55 bg-foreground/[0.06] text-foreground"
                : "border-border/55 text-muted-foreground hover:text-foreground",
            )}
          >
            {RELATIONSHIP_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <ConfirmButton
        disabled={!ready}
        onClick={() =>
          onConfirm({
            kind: "relationship-future",
            personName: person!.name,
            personRelation: RELATION_LABELS[person!.relation],
            personId: person!.id,
            status,
          })
        }
      />
    </div>
  );
}

// ─── Milestone ─────────────────────────────────────────────────────

function MilestoneForm({
  onConfirm,
}: {
  onConfirm: (c: ReadingContext) => void;
}) {
  const [milestone, setMilestone] = useState<MilestoneKind>("new-job");
  const [note, setNote] = useState("");
  const kinds = Object.keys(MILESTONE_LABELS) as MilestoneKind[];

  return (
    <div className="space-y-5">
      <FieldLabel>Which threshold?</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setMilestone(k)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11.5px] transition-smooth",
              milestone === k
                ? "border-foreground/55 bg-foreground/[0.06] text-foreground"
                : "border-border/55 text-muted-foreground hover:text-foreground",
            )}
          >
            {MILESTONE_LABELS[k]}
          </button>
        ))}
      </div>

      <FieldLabel>One line about it  <Quiet>optional</Quiet></FieldLabel>
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What this moment means to you"
        className="h-10 text-[13px]"
      />

      <ConfirmButton
        onClick={() =>
          onConfirm({
            kind: "milestone",
            milestone,
            note: note.trim() || undefined,
          })
        }
      />
    </div>
  );
}

// ─── Small UI bits ────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
    {children}
  </p>
);

const Quiet = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-1 text-muted-foreground/60 normal-case tracking-normal font-normal">
    ({children})
  </span>
);

const ConfirmButton = ({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    size="lg"
    className="w-full mt-1 group"
  >
    Continue to draw
    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
  </Button>
);
