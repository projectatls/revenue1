// app/api/tmdb/route.js
// Server-side proxy to TMDB — keeps the API key hidden from the client.

const TMDB_KEY = process.env.TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const query = searchParams.get("query") || "";
  const id = searchParams.get("id") || "";
  const mediaType = searchParams.get("type") || "movie";

  if (!TMDB_KEY) {
    return Response.json({ error: "TMDB_API_KEY is not set on the server." }, { status: 500 });
  }

  let url = "";

  switch (endpoint) {
    case "trending":
      url = `${BASE}/trending/${mediaType}/week?api_key=${TMDB_KEY}`;
      break;
    case "popular":
      url = `${BASE}/${mediaType}/popular?api_key=${TMDB_KEY}&page=1`;
      break;
    case "top_rated":
      url = `${BASE}/${mediaType}/top_rated?api_key=${TMDB_KEY}&page=1`;
      break;
    case "new":
      url = `${BASE}/${mediaType}/${mediaType === "movie" ? "now_playing" : "on_the_air"}?api_key=${TMDB_KEY}&page=1`;
      break;
    case "search":
      url = `${BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;
      break;
    case "details":
      url = `${BASE}/${mediaType}/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits`;
      break;
    case "videos":
      url = `${BASE}/${mediaType}/${id}/videos?api_key=${TMDB_KEY}`;
      break;
    case "watch_providers":
      url = `${BASE}/${mediaType}/${id}/watch/providers?api_key=${TMDB_KEY}`;
      break;
    case "genres":
      url = `${BASE}/genre/${mediaType}/list?api_key=${TMDB_KEY}`;
      break;
    case "discover":
      url = `${BASE}/discover/${mediaType}?api_key=${TMDB_KEY}&sort_by=popularity.desc&page=1`;
      break;
    default:
      return Response.json({ error: "Unknown endpoint" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: "TMDB fetch failed", details: String(err) }, { status: 500 });
  }
}
