export async function GET() {
  const checks = await Promise.allSettled([
    checkDeezer(),
    checkiTunes(),
    checkSpotify(),
    checkTidal(),
    checkYouTube(),
  ]);

  const services = [
    { name: "Deezer", required: true, result: checks[0] },
    { name: "Apple Music", required: true, result: checks[1] },
    { name: "Spotify", required: false, result: checks[2] },
    { name: "Tidal", required: false, result: checks[3] },
    { name: "YouTube", required: true, result: checks[4] },
  ];

  const details = services.map(({ name, required, result }) => {
    const status =
      result.status === "fulfilled" && result.value.ok
        ? "ok"
        : result.status === "fulfilled" && !result.value.ok
          ? "degraded"
          : "down";

    return {
      service: name,
      status,
      required,
      latencyMs:
        result.status === "fulfilled" && typeof result.value.latencyMs === "number"
          ? result.value.latencyMs
          : null,
      error:
        result.status === "rejected"
          ? String(result.reason)
          : result.status === "fulfilled" && result.value.error
            ? result.value.error
            : null,
    };
  });

  const allRequiredOk = details
    .filter((d) => d.required)
    .every((d) => d.status === "ok");
  const someRequiredDown = details
    .filter((d) => d.required)
    .some((d) => d.status === "down");

  const overall = someRequiredDown ? "down" : allRequiredOk ? "healthy" : "degraded";

  return Response.json(
    { status: overall, services: details, timestamp: new Date().toISOString() },
    { status: someRequiredDown ? 503 : 200, headers: corsHeaders() }
  );
}

async function checkDeezer() {
  const start = Date.now();
  try {
    const res = await fetch("https://api.deezer.com/track/3135556", { signal: AbortSignal.timeout(5000) });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e) };
  }
}

async function checkiTunes() {
  const start = Date.now();
  try {
    const res = await fetch("https://itunes.apple.com/lookup?id=3135556", { signal: AbortSignal.timeout(5000) });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e) };
  }
}

async function checkSpotify() {
  const start = Date.now();
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { ok: true, latencyMs: Date.now() - start, error: "SPOTIFY_CLIENT_ID/SECRET not configured; Spotify links limited." };
  }
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(5000),
    });
    if (!tokenRes.ok) {
      return { ok: false, latencyMs: Date.now() - start, error: `token HTTP ${tokenRes.status}` };
    }
    const data = await tokenRes.json();
    const res = await fetch("https://api.spotify.com/v1/tracks/1wNgc05aCdwZHRuC9wMixm", {
      headers: { Authorization: `Bearer ${data.access_token}` },
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e) };
  }
}

async function checkTidal() {
  const start = Date.now();
  const clientId = process.env.TIDAL_CLIENT_ID;
  const clientSecret = process.env.TIDAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { ok: true, latencyMs: Date.now() - start, error: "TIDAL_CLIENT_ID/SECRET not configured; Tidal output links disabled." };
  }
  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://auth.tidal.com/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${basic}` },
      body: "grant_type=client_credentials&scope=tidal.minimal",
      signal: AbortSignal.timeout(5000),
    });
    if (!tokenRes.ok) {
      return { ok: false, latencyMs: Date.now() - start, error: `token HTTP ${tokenRes.status}` };
    }
    const data = await tokenRes.json();
    if (!data?.access_token) {
      return { ok: false, latencyMs: Date.now() - start, error: "No access_token returned" };
    }
    const res = await fetch("https://openapi.tidal.com/v2/tracks?filter%5Bisrc%5D=USUG11100205&countryCode=US&page%5Bsize%5D=1", {
      headers: { Authorization: `Bearer ${data.access_token}`, Accept: "application/vnd.api+json" },
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `openapi HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e) };
  }
}

async function checkYouTube() {
  const start = Date.now();
  try {
    const res = await fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json", {
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e) };
  }
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
