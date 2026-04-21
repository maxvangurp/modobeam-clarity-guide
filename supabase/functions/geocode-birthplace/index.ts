// Modobeam — geocode a free-text birth place into lat/lon + a tz offset
// estimate at a given birth date. Uses Nominatim (OpenStreetMap) for
// geocoding and a lightweight tz lookup via Open-Meteo's free
// timezone API. Both services are free and require a User-Agent.
//
// This function is intentionally permissive: if any step fails we still
// return what we have, so the client can fall back to "solar houses".

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Payload {
  query: string; // e.g. "Paris, France" or "Brooklyn, NY"
  birthDate?: string | null; // ISO yyyy-mm-dd — used to pick the right historical tz
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Payload;
    const query = (body.query ?? "").trim();
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: "Query too short" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ua = "Modobeam/1.0 (reflection app)";

    // 1. Geocode with Nominatim
    const geoUrl = new URL("https://nominatim.openstreetmap.org/search");
    geoUrl.searchParams.set("q", query);
    geoUrl.searchParams.set("format", "json");
    geoUrl.searchParams.set("limit", "1");
    geoUrl.searchParams.set("addressdetails", "0");

    const geoRes = await fetch(geoUrl.toString(), {
      headers: { "User-Agent": ua, Accept: "application/json" },
    });
    if (!geoRes.ok) {
      const t = await geoRes.text();
      console.error("Nominatim error", geoRes.status, t);
      return new Response(
        JSON.stringify({ error: "Geocoding service unavailable" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const results = (await geoRes.json()) as NominatimResult[];
    if (!Array.isArray(results) || results.length === 0) {
      return new Response(
        JSON.stringify({ error: "Place not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const first = results[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Resolve a timezone offset at the birth date.
    // Open-Meteo's timezone API returns IANA timezone for given coords.
    // We then ask the Time Zone API for the offset on the birth date.
    let tzOffsetMin: number | null = null;
    let tzName: string | null = null;
    try {
      const tzUrl = new URL("https://api.open-meteo.com/v1/forecast");
      tzUrl.searchParams.set("latitude", String(lat));
      tzUrl.searchParams.set("longitude", String(lon));
      tzUrl.searchParams.set("timezone", "auto");
      tzUrl.searchParams.set("forecast_days", "1");
      // We don't need any weather — pick the smallest valid field.
      tzUrl.searchParams.set("hourly", "temperature_2m");
      const tzRes = await fetch(tzUrl.toString(), {
        headers: { "User-Agent": ua },
      });
      if (tzRes.ok) {
        const tzData = (await tzRes.json()) as {
          timezone?: string;
          utc_offset_seconds?: number;
        };
        tzName = tzData.timezone ?? null;
        // Open-Meteo gives the *current* offset. For historical accuracy
        // we recompute using the IANA name + birth date.
        if (tzName && body.birthDate) {
          tzOffsetMin = computeOffsetMinutes(tzName, body.birthDate);
        } else if (typeof tzData.utc_offset_seconds === "number") {
          tzOffsetMin = Math.round(tzData.utc_offset_seconds / 60);
        }
      }
    } catch (e) {
      console.warn("tz lookup failed", e);
    }

    return new Response(
      JSON.stringify({
        lat,
        lon,
        displayName: first.display_name,
        timezone: tzName,
        tzOffsetMin,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("geocode-birthplace error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Compute the UTC offset in minutes for a given IANA timezone at noon on
// a given local date. Uses Intl with the named timezone — accurate for
// all dates Deno's ICU bundle covers (1900 onward in practice).
function computeOffsetMinutes(timezone: string, isoDate: string): number | null {
  try {
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    // Take noon UTC on that date as a reference instant
    const utcMs = Date.UTC(y, m - 1, d, 12, 0, 0);
    const ref = new Date(utcMs);
    // Use Intl to format that instant in the target timezone, then parse
    // the wall-clock fields to compute the offset.
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(ref);
    const get = (t: string) =>
      Number(parts.find((p) => p.type === t)?.value ?? "0");
    const localMs = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") % 24,
      get("minute"),
      get("second"),
    );
    return Math.round((localMs - utcMs) / 60000);
  } catch {
    return null;
  }
}
