// Modobeam — People manager
//
// A small private list of the people you reflect about. Used by
// friend/relationship-future readings as a quick picker, and editable
// here in Preferences. Stored locally; never sent anywhere except into
// the AI prompt as soft context.

import { useEffect, useState } from "react";
import { Plus, Users, X, Trash2, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  deletePerson,
  listPeople,
  RELATION_LABELS,
  upsertPerson,
  type Person,
  type PersonRelation,
} from "@/lib/people";

export const PeopleManager = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [editing, setEditing] = useState<Person | null>(null);
  const [adding, setAdding] = useState(false);

  const refresh = () => setPeople(listPeople());
  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-3">
      <div
        className="rounded-[1.15rem] border border-border/56 bg-[linear-gradient(135deg,hsl(40_30%_98%/0.78)_0%,hsl(211_42%_94%/0.62)_55%,hsl(218_36%_88%/0.5)_100%)] px-4 py-4 shadow-soft backdrop-blur"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <span className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[hsl(218_38%_70%)]/30 bg-background/76 shadow-[0_0_14px_hsl(218_60%_70%/0.28)] backdrop-blur">
              <Users
                className="h-4 w-4 text-[hsl(218_45%_30%)]/82"
                strokeWidth={1.7}
              />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(218_30%_38%)]/82">
                People you reflect about
              </p>
              <p className="mt-1 text-[13px] leading-[1.58] text-foreground/82">
                Used by Friend and Relationship readings — pick instead of
                retyping. Stored only on this device.
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        {people.length > 0 && (
          <ul className="mt-4 space-y-2">
            {people.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border/55 bg-background/72 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/85">
                    {RELATION_LABELS[p.relation]}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    aria-label="Edit"
                    className="text-muted-foreground/80 hover:text-foreground p-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deletePerson(p.id);
                      refresh();
                    }}
                    aria-label="Remove"
                    className="text-muted-foreground/80 hover:text-foreground p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add / edit form */}
        {(adding || editing) && (
          <div className="mt-3">
            <PersonForm
              initial={editing ?? undefined}
              onCancel={() => {
                setAdding(false);
                setEditing(null);
              }}
              onSave={(input) => {
                upsertPerson(input);
                setAdding(false);
                setEditing(null);
                refresh();
              }}
            />
          </div>
        )}

        {!adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 bg-background/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Plus className="h-3 w-3" /> Add someone
          </button>
        )}

        {people.length === 0 && !adding && !editing && (
          <p className="mt-3 text-[11.5px] italic text-muted-foreground/80">
            Empty for now — add people as they come up in your reflections.
          </p>
        )}
      </div>
    </div>
  );
};

const PersonForm = ({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Person;
  onSave: (input: {
    id?: string;
    name: string;
    relation: PersonRelation;
    note?: string;
  }) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [relation, setRelation] = useState<PersonRelation>(
    initial?.relation ?? "close-friend",
  );
  const [note, setNote] = useState(initial?.note ?? "");

  const ready = !!name.trim();

  return (
    <div className="space-y-2.5 rounded-2xl border border-border/55 bg-background/82 px-3.5 py-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/85">
          {initial ? "Edit person" : "Add someone"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground/70 hover:text-foreground"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 40))}
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

      <Input
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 80))}
        placeholder="A short note (optional)"
        className="h-9 text-[13px]"
      />

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!ready}
        onClick={() =>
          onSave({
            id: initial?.id,
            name: name.trim(),
            relation,
            note: note.trim() || undefined,
          })
        }
        className="w-full"
      >
        <Check className="mr-1 h-3.5 w-3.5" />
        {initial ? "Save changes" : "Save person"}
      </Button>
    </div>
  );
};
