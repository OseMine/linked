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
    { name: "iTunes", required: true, result: checks[1] },
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
  if (!clientId) {
    return { ok: false, latencyMs: 0, error: "No SPOTIFY_CLIENT_ID configured" };
  }
  try {
    const res = await fetch("https://api.spotify.com/v1/tracks/4cOdK2wGEL8SetjwfNnPKc", {
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e) };
  }
}

async function checkTidal() {
  const start = Date.now();
  try {
    const res = await fetch("https://gqlapi.tidal.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start, error: res.ok ? null : `HTTP ${res.status}` };
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
