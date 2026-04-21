// Modobeam — shared birth details collector.
// Used in onboarding (final step) and Preferences. Birth time and place
// are optional — if missing we quietly fall back to "solar houses".

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface BirthDetails {
  birthday?: string;
  birthTime?: string | null;
  birthPlace?: string | null;
  birthLat?: number | null;
  birthLon?: number | null;
  birthTzOffsetMin?: number | null;
}

interface Props {
  value: BirthDetails;
  onChange: (next: BirthDetails) => void;
  /** When true, hide the "Birthday" field (collected elsewhere). */
  hideBirthday?: boolean;
}

type GeoState = "idle" | "loading" | "ok" | "error";

export const BirthDetailsForm = ({ value, onChange, hideBirthday }: Props) => {
  const [placeQuery, setPlaceQuery] = useState(value.birthPlace ?? "");
  const [geoState, setGeoState] = useState<GeoState>(
    value.birthLat != null && value.birthLon != null ? "ok" : "idle",
  );
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const lookupPlace = async () => {
    const q = placeQuery.trim();
    if (q.length < 2) return;
    setGeoState("loading");
    setGeoMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "geocode-birthplace",
        { body: { query: q, birthDate: value.birthday ?? null } },
      );
      if (error) throw error;
      const d = data as {
        lat?: number;
        lon?: number;
        displayName?: string;
        tzOffsetMin?: number | null;
        error?: string;
      };
      if (d.error || d.lat == null || d.lon == null) {
        throw new Error(d.error ?? "Place not found");
      }
      onChange({
        ...value,
        birthPlace: d.displayName ?? q,
        birthLat: d.lat,
        birthLon: d.lon,
        birthTzOffsetMin: d.tzOffsetMin ?? null,
      });
      setGeoState("ok");
      setGeoMsg(d.displayName ?? null);
    } catch (e) {
      setGeoState("error");
      setGeoMsg(
        e instanceof Error ? e.message : "Couldn't find that place",
      );
    }
  };

  return (
    <div className="grid gap-4">
      {!hideBirthday && (
        <Field label="Birthday" htmlFor="birthday" hint="Sets your sun sign.">
          <Input
            id="birthday"
            type="date"
            value={value.birthday ?? ""}
            onChange={(e) => onChange({ ...value, birthday: e.target.value })}
            className="rounded-2xl bg-card/70 border-border/60 backdrop-blur h-12 text-base"
          />
        </Field>
      )}

      <Field
        label="Birth time"
        htmlFor="birthTime"
        hint="Optional — unlocks your rising sign. Skip if unsure."
      >
        <Input
          id="birthTime"
          type="time"
          value={value.birthTime ?? ""}
          onChange={(e) =>
            onChange({ ...value, birthTime: e.target.value || null })
          }
          className="rounded-2xl bg-card/70 border-border/60 backdrop-blur h-12 text-base"
        />
      </Field>

      <Field
        label="Birth place"
        htmlFor="birthPlace"
        hint="Optional — city, region. Adds depth to the lens."
      >
        <div className="flex gap-2">
          <Input
            id="birthPlace"
            value={placeQuery}
            onChange={(e) => {
              setPlaceQuery(e.target.value);
              setGeoState("idle");
              if (!e.target.value.trim()) {
                onChange({
                  ...value,
                  birthPlace: null,
                  birthLat: null,
                  birthLon: null,
                  birthTzOffsetMin: null,
                });
              }
            }}
            onBlur={() => {
              if (
                placeQuery.trim() &&
                placeQuery.trim() !== (value.birthPlace ?? "") &&
                geoState !== "loading"
              ) {
                lookupPlace();
              }
            }}
            placeholder="e.g. Lisbon, Portugal"
            className="rounded-2xl bg-card/70 border-border/60 backdrop-blur h-12 text-base flex-1"
          />
          <button
            type="button"
            onClick={lookupPlace}
            disabled={geoState === "loading" || placeQuery.trim().length < 2}
            className="h-12 px-4 rounded-2xl bg-card/70 border border-border/60 backdrop-blur text-foreground/80 hover:text-foreground hover:bg-card transition-smooth disabled:opacity-40 inline-flex items-center gap-1.5 text-[13px]"
            aria-label="Look up place"
          >
            {geoState === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : geoState === "ok" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span>Find</span>
          </button>
        </div>
        {geoState === "ok" && geoMsg && (
          <p className="text-[11px] text-muted-foreground/80 mt-1.5 leading-relaxed">
            <span className="text-foreground/70">Located:</span> {geoMsg}
          </p>
        )}
        {geoState === "error" && geoMsg && (
          <p className="text-[11px] text-destructive/80 mt-1.5 leading-relaxed">
            {geoMsg}
          </p>
        )}
      </Field>
    </div>
  );
};

const Field = ({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-1.5">
    <label
      htmlFor={htmlFor}
      className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
    >
      {label}
    </label>
    {children}
    {hint && (
      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
        {hint}
      </p>
    )}
  </div>
);
