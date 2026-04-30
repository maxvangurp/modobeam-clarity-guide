// Modobeam — People you reflect about
//
// A small private list, stored locally. Used by friend-based and
// relationship-based readings so the user doesn't have to retype the
// same person each time. Reusable across modes; never sent anywhere
// except into the AI prompt as soft context.

const KEY = "modobeam_people_v1";

export type PersonRelation =
  | "partner"
  | "dating"
  | "ex"
  | "undefined"
  | "close-friend"
  | "friend"
  | "family"
  | "colleague"
  | "other";

export const RELATION_LABELS: Record<PersonRelation, string> = {
  partner: "Partner",
  dating: "Dating",
  ex: "Ex",
  undefined: "Undefined",
  "close-friend": "Close friend",
  friend: "Friend",
  family: "Family",
  colleague: "Colleague",
  other: "Someone else",
};

export interface Person {
  id: string;
  name: string;
  relation: PersonRelation;
  note?: string;
  createdAt: number;
}

function read(): Person[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Person[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: Person[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listPeople(): Person[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getPerson(id: string): Person | undefined {
  return read().find((p) => p.id === id);
}

export function upsertPerson(input: {
  id?: string;
  name: string;
  relation: PersonRelation;
  note?: string;
}): Person {
  const list = read();
  if (input.id) {
    const idx = list.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...input } as Person;
      write(list);
      return list[idx];
    }
  }
  const next: Person = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    relation: input.relation,
    note: input.note?.trim() || undefined,
    createdAt: Date.now(),
  };
  list.unshift(next);
  write(list);
  return next;
}

export function deletePerson(id: string): void {
  write(read().filter((p) => p.id !== id));
}
