// Modobeam — astrology as a soft, optional lens.
//
// Self-contained TypeScript implementation. No ephemeris bundle: we only
// need sun sign, ascendant, and Placidus house cusps — all derivable from
// well-known formulas (Jean Meeus, low-precision sun position; standard
// Placidus semi-arc method for houses). Accuracy is well within what
// matters for a *symbolic* layer (sun sign exact; ascendant ±0.5°).
//
// Philosophy: this layer should feel like a quiet perspective. It informs
// AI tone, surfaces a "Focus: …" label when reading content fits a life
// area, and shows a small sign glyph on Home / Profile. It never predicts
// and never dominates the UI.

const KEY = "modobeam_astro_cache_v1";

// ────────────────────────────────────────────────────────────────────────
// Types

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export interface BirthInput {
  date: string; // ISO yyyy-mm-dd
  time?: string | null; // HH:MM (24h, local at birth place)
  lat?: number | null;
  lon?: number | null;
  // Offset from UTC at the birth moment (in minutes, e.g. -300 for EST).
  // If not provided, we fall back to the user's *current* device offset
  // for that date — usually wrong for old birthdays in different zones,
  // which is why the geocoder also returns a tz offset estimate.
  tzOffsetMin?: number | null;
}

export interface AstroChart {
  sun: {
    sign: ZodiacSign;
    longitude: number; // ecliptic longitude in degrees
  };
  ascendant: {
    sign: ZodiacSign;
    longitude: number;
  } | null;
  // 12 house cusps in degrees (index 0 = 1st house, 11 = 12th).
  // null when birth time/lat is missing → falls back to "solar houses"
  // (sun sign as 1st cusp).
  houses: number[];
  isSolarHouses: boolean;
}

// 12 astrological houses → simple, human life-area labels.
// Kept secular and grounded — these are NOT mystical descriptors, they're
// the everyday domains the houses traditionally refer to.
export const HOUSE_AREAS: { house: number; key: string; label: string }[] = [
  { house: 1, key: "self", label: "Self" },
  { house: 2, key: "values", label: "Values & resources" },
  { house: 3, key: "voice", label: "Voice & curiosity" },
  { house: 4, key: "home", label: "Home & inner life" },
  { house: 5, key: "expression", label: "Expression & play" },
  { house: 6, key: "rhythm", label: "Daily rhythm" },
  { house: 7, key: "relationships", label: "Relationships" },
  { house: 8, key: "depth", label: "Depth & change" },
  { house: 9, key: "meaning", label: "Meaning & search" },
  { house: 10, key: "direction", label: "Direction & work" },
  { house: 11, key: "belonging", label: "Belonging & vision" },
  { house: 12, key: "inner", label: "Inner processing" },
];

export const SIGN_GLYPHS: Record<ZodiacSign, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

// AI-tone hint per sign — soft adjective pair, not a personality verdict.
// The reflect function reads this and adjusts pacing/directness slightly.
export const SIGN_TONE_HINT: Record<ZodiacSign, string> = {
  Aries: "lean a touch more direct and forward-leaning",
  Taurus: "lean a touch slower, sensory, grounded",
  Gemini: "lean a touch more curious, with one open question more than usual",
  Cancer: "lean a touch more tender, attuned to inner weather",
  Leo: "lean a touch warmer and more vivid in image",
  Virgo: "lean a touch more precise and observational",
  Libra: "lean a touch more relational, hold both sides briefly",
  Scorpio: "lean a touch deeper, willing to name what's beneath",
  Sagittarius: "lean a touch more open, allow a small wider view",
  Capricorn: "lean a touch more measured and patient with time",
  Aquarius: "lean a touch more reflective and slightly distant in framing",
  Pisces: "lean a touch more flowing, leave one thing half-said",
};

// ────────────────────────────────────────────────────────────────────────
// Math helpers

const DEG = Math.PI / 180;
const norm360 = (x: number): number => ((x % 360) + 360) % 360;

const SIGNS: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export function signFromLongitude(lon: number): ZodiacSign {
  const idx = Math.floor(norm360(lon) / 30);
  return SIGNS[idx];
}

// Julian Day for a UTC moment.
function julianDay(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number,
): number {
  let yy = y;
  let mm = m;
  if (mm <= 2) {
    yy -= 1;
    mm += 12;
  }
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = d + (hour + minute / 60) / 24;
  return (
    Math.floor(365.25 * (yy + 4716)) +
    Math.floor(30.6001 * (mm + 1)) +
    dayFrac +
    B -
    1524.5
  );
}

// Low-precision sun ecliptic longitude (Meeus ch. 25, simplified).
// Accurate to ~0.01° — far better than we need for sign assignment.
function sunLongitudeFromJD(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = M * DEG;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  return norm360(L0 + C);
}

// Mean obliquity of the ecliptic (degrees).
function obliquityFromJD(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  // Meeus 22.2 (low precision)
  const eps =
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  return eps;
}

// Greenwich Mean Sidereal Time in degrees.
function gmstFromJD(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return norm360(gmst);
}

// Compute the ascendant (eastern horizon ecliptic longitude).
function ascendantLongitude(
  lst: number, // local sidereal time in degrees
  latitude: number, // degrees
  obliquity: number, // degrees
): number {
  const ramc = lst * DEG;
  const lat = latitude * DEG;
  const eps = obliquity * DEG;
  // Meeus eq. (uses the "rising" longitude formula)
  const y = -Math.cos(ramc);
  const x =
    Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps);
  let asc = Math.atan2(y, x) / DEG;
  asc = norm360(asc);
  return asc;
}

// Midheaven (MC) — ecliptic longitude where the meridian crosses.
function midheavenLongitude(lst: number, obliquity: number): number {
  const ramc = lst * DEG;
  const eps = obliquity * DEG;
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG;
  return norm360(mc);
}

// Placidus house cusps. Returns 12 cusp longitudes [house1..house12].
// Standard semi-arc method. Falls back gracefully near the poles where
// Placidus is undefined (|lat| > ~66°): we use equal houses from the
// ascendant in that case.
function placidusHouses(
  lst: number,
  latitude: number,
  obliquity: number,
): number[] {
  const ascLon = ascendantLongitude(lst, latitude, obliquity);
  const mc = midheavenLongitude(lst, obliquity);

  // Polar / undefined region — fall back to equal houses from ASC
  if (Math.abs(latitude) > 66) {
    return Array.from({ length: 12 }, (_, i) => norm360(ascLon + i * 30));
  }

  const eps = obliquity * DEG;
  const lat = latitude * DEG;
  const ramc = lst; // degrees

  // Helper: compute Placidus intermediate house cusp.
  // n is the fraction of the semi-arc (1/3 or 2/3); mode chooses houses
  // 11/12 (above horizon, eastern) vs 2/3 (below horizon, eastern).
  // We iterate to converge — Placidus has no closed form.
  const intermediate = (
    f: number, // fraction of semi-arc (e.g. 1/3 or 2/3)
    mode: "11" | "12" | "2" | "3",
  ): number => {
    // Initial guess: distribute equally between MC/ASC/IC arcs.
    let H = 0;
    if (mode === "11") H = ramc + 30;
    if (mode === "12") H = ramc + 60;
    if (mode === "2") H = ramc + 120;
    if (mode === "3") H = ramc + 150;
    for (let i = 0; i < 12; i++) {
      const Hr = norm360(H) * DEG;
      const dec = Math.asin(Math.sin(eps) * Math.sin(Hr));
      const ad = Math.asin(Math.tan(lat) * Math.tan(dec));
      let semiArc: number;
      if (mode === "11" || mode === "12") {
        semiArc = Math.PI / 2 + ad;
      } else {
        semiArc = Math.PI / 2 - ad;
      }
      const newH =
        mode === "11" || mode === "12"
          ? ramc + (semiArc * f) / DEG
          : ramc + 180 - (semiArc * f) / DEG;
      if (Math.abs(norm360(newH) - norm360(H)) < 0.001) {
        H = newH;
        break;
      }
      H = newH;
    }
    const HrFinal = norm360(H) * DEG;
    const lonRad = Math.atan2(
      Math.sin(HrFinal),
      Math.cos(HrFinal) * Math.cos(eps),
    );
    return norm360(lonRad / DEG);
  };

  // The 4 angular cusps are exact:
  const c1 = ascLon; // ASC = 1st
  const c10 = mc; // MC = 10th
  const c7 = norm360(ascLon + 180); // DSC = 7th
  const c4 = norm360(mc + 180); // IC = 4th

  // Intermediate cusps via Placidus iteration (rough but stable enough
  // for our symbolic use — we round to the sign anyway).
  const c11 = intermediate(1 / 3, "11");
  const c12 = intermediate(2 / 3, "12");
  const c2 = intermediate(1 / 3, "2");
  const c3 = intermediate(2 / 3, "3");

  // Opposite cusps:
  const c5 = norm360(c11 + 180);
  const c6 = norm360(c12 + 180);
  const c8 = norm360(c2 + 180);
  const c9 = norm360(c3 + 180);

  return [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12];
}

// ────────────────────────────────────────────────────────────────────────
// Public chart computation

/**
 * Build a chart from birth input. If birth time / lat / lon are missing,
 * returns sun-only with `houses` derived as "solar houses" (sun sign as
 * 1st house, then equal 30° steps).
 */
export function computeChart(input: BirthInput): AstroChart | null {
  if (!input.date) return null;
  const [yStr, mStr, dStr] = input.date.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d) return null;

  // Default to noon UTC if no time → sun sign is unaffected at noon.
  const hasTime = Boolean(input.time);
  const [hStr, minStr] = (input.time ?? "12:00").split(":");
  let hour = Number(hStr) || 0;
  const minute = Number(minStr) || 0;

  // Convert local birth time → UTC if we have a tz offset
  const tzMin = input.tzOffsetMin ?? null;
  if (hasTime && tzMin !== null) {
    // Local = UTC + offset/60 → UTC = Local - offset/60
    hour -= tzMin / 60;
  }
  const jd = julianDay(y, m, d, hour, minute);
  const sunLon = sunLongitudeFromJD(jd);
  const sun = { longitude: sunLon, sign: signFromLongitude(sunLon) };

  // No time or place → sun + solar houses
  if (
    !hasTime ||
    input.lat === null ||
    input.lat === undefined ||
    input.lon === null ||
    input.lon === undefined
  ) {
    const startLon = Math.floor(sunLon / 30) * 30; // sign cusp
    const solar = Array.from({ length: 12 }, (_, i) =>
      norm360(startLon + i * 30),
    );
    return { sun, ascendant: null, houses: solar, isSolarHouses: true };
  }

  // Full chart
  const obliquity = obliquityFromJD(jd);
  const gmst = gmstFromJD(jd);
  const lst = norm360(gmst + input.lon); // local sidereal time
  const ascLon = ascendantLongitude(lst, input.lat, obliquity);
  const houses = placidusHouses(lst, input.lat, obliquity);
  return {
    sun,
    ascendant: { longitude: ascLon, sign: signFromLongitude(ascLon) },
    houses,
    isSolarHouses: false,
  };
}

// Which house does a given ecliptic longitude fall in?
export function houseOfLongitude(lon: number, cusps: number[]): number {
  const L = norm360(lon);
  for (let i = 0; i < 12; i++) {
    const a = norm360(cusps[i]);
    const b = norm360(cusps[(i + 1) % 12]);
    // Handle wrap-around
    if (a < b) {
      if (L >= a && L < b) return i + 1;
    } else {
      if (L >= a || L < b) return i + 1;
    }
  }
  return 1;
}

// ────────────────────────────────────────────────────────────────────────
// Local persistence cache (avoids recomputing on every render)

export interface AstroCache {
  birthHash: string;
  chart: AstroChart;
  computedAt: string;
}

function hashBirth(input: BirthInput): string {
  return `${input.date}|${input.time ?? ""}|${input.lat ?? ""}|${input.lon ?? ""}|${input.tzOffsetMin ?? ""}`;
}

export function getCachedChart(input: BirthInput | null): AstroChart | null {
  if (!input) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const cached = JSON.parse(raw) as AstroCache;
      if (cached.birthHash === hashBirth(input)) return cached.chart;
    }
  } catch {
    /* noop */
  }
  const chart = computeChart(input);
  if (!chart) return null;
  try {
    const cache: AstroCache = {
      birthHash: hashBirth(input),
      chart,
      computedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* noop */
  }
  return chart;
}

export function clearChartCache(): void {
  localStorage.removeItem(KEY);
}

// ────────────────────────────────────────────────────────────────────────
// Life-area mapping for reading content
//
// We keep this strictly retrospective: given the *content* of a reading
// (theme, tension, card categories), pick a life area from the 12-house
// framework that fits. The chart, when present, *biases* the choice
// toward houses where the user's ascendant/sun naturally emphasizes.

const KEYWORD_TO_HOUSE: Record<string, number> = {
  // 1 self
  identity: 1,
  self: 1,
  body: 1,
  presence: 1,
  // 2 values & resources
  worth: 2,
  value: 2,
  values: 2,
  money: 2,
  enough: 2,
  // 3 voice & curiosity
  voice: 3,
  curiosity: 3,
  learning: 3,
  sibling: 3,
  thought: 3,
  // 4 home & inner life
  home: 4,
  family: 4,
  roots: 4,
  past: 4,
  childhood: 4,
  // 5 expression & play
  expression: 5,
  creative: 5,
  play: 5,
  joy: 5,
  child: 5,
  art: 5,
  // 6 daily rhythm
  routine: 6,
  rhythm: 6,
  habit: 6,
  health: 6,
  body: 6,
  work: 6, // mild — work appears in both 6 (daily) and 10 (career)
  // 7 relationships
  partner: 7,
  relationship: 7,
  love: 7,
  intimacy: 7,
  closeness: 7,
  friend: 7,
  alone: 7,
  // 8 depth & change
  fear: 8,
  death: 8,
  ending: 8,
  shadow: 8,
  trust: 8,
  control: 8,
  power: 8,
  // 9 meaning & search
  meaning: 9,
  belief: 9,
  travel: 9,
  search: 9,
  truth: 9,
  // 10 direction & work
  direction: 10,
  career: 10,
  goal: 10,
  ambition: 10,
  path: 10,
  purpose: 10,
  // 11 belonging & vision
  community: 11,
  belonging: 11,
  hope: 11,
  future: 11,
  // 12 inner processing
  rest: 12,
  release: 12,
  unconscious: 12,
  solitude: 12,
  surrender: 12,
};

// Card category → soft house tilt. Used as a fallback signal when
// keyword matches aren't strong enough.
const CATEGORY_TO_HOUSES: Record<string, number[]> = {
  Mind: [3, 9],
  Emotion: [4, 7, 8],
  Action: [1, 6, 10],
  "Life Patterns": [11, 12],
};

export interface FocusArea {
  house: number;
  key: string;
  label: string;
}

/**
 * Infer a single "focus area" (house) from reading content. Returns
 * null if nothing in the text or cards points strongly enough — we'd
 * rather show no label than a vague one.
 *
 * `chart` (when present) biases scoring toward the user's ascendant +
 * sun house — quietly weighting their natal emphasis.
 */
export function inferFocusArea(opts: {
  text: string; // theme + tension + summary, freely concatenated
  cardCategories?: string[];
  chart?: AstroChart | null;
}): FocusArea | null {
  const text = opts.text.toLowerCase();
  const scores = new Map<number, number>();
  const bump = (h: number, w: number) =>
    scores.set(h, (scores.get(h) ?? 0) + w);

  // Keyword scan — main signal.
  for (const [word, house] of Object.entries(KEYWORD_TO_HOUSE)) {
    // simple word-boundary check
    const re = new RegExp(`\\b${word}\\b`, "g");
    const matches = text.match(re);
    if (matches) bump(house, matches.length * 2);
  }

  // Category tilt — secondary signal.
  if (opts.cardCategories) {
    for (const cat of opts.cardCategories) {
      const houses = CATEGORY_TO_HOUSES[cat];
      if (houses) houses.forEach((h) => bump(h, 0.5));
    }
  }

  // Natal weighting — sun sign and ascendant softly emphasize their houses.
  if (opts.chart) {
    const { houses, sun, ascendant } = opts.chart;
    const sunHouse = houseOfLongitude(sun.longitude, houses);
    bump(sunHouse, 0.75);
    if (ascendant) bump(1, 0.5); // ascendant always defines the 1st
  }

  if (scores.size === 0) return null;
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [topHouse, topScore] = sorted[0];
  // Confidence threshold — at least one solid keyword hit.
  if (topScore < 1.5) return null;
  const area = HOUSE_AREAS.find((a) => a.house === topHouse);
  if (!area) return null;
  return { house: topHouse, key: area.key, label: area.label };
}

// Convenience for AI payload — a compact, clearly-labeled summary the
// edge function can interpret without re-implementing astrology.
export function buildAstroContext(
  chart: AstroChart | null,
  focus: FocusArea | null,
): {
  sunSign?: string;
  ascendantSign?: string | null;
  isSolarHouses?: boolean;
  toneHint?: string;
  focusArea?: { key: string; label: string } | null;
} | null {
  if (!chart && !focus) return null;
  return {
    sunSign: chart?.sun.sign,
    ascendantSign: chart?.ascendant?.sign ?? null,
    isSolarHouses: chart?.isSolarHouses,
    toneHint: chart ? SIGN_TONE_HINT[chart.sun.sign] : undefined,
    focusArea: focus ? { key: focus.key, label: focus.label } : null,
  };
}
