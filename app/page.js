"use client";
import { useState, useEffect, useRef } from "react";

const IMG = "https://image.tmdb.org/t/p";
const SITE_NAME = "movi";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const PLATFORMS = {
  8:    {name:"Netflix",       short:"Netflix",  color:"#E50914", bg:"#1a0000", label:"N",  url:"https://netflix.com"},
  9:    {name:"Prime Video",   short:"Prime",    color:"#00A8E1", bg:"#001520", label:"P",  url:"https://primevideo.com"},
  337:  {name:"Disney+",       short:"Disney+",  color:"#1a78ff", bg:"#00001a", label:"D+", url:"https://disneyplus.com"},
  15:   {name:"Hulu",          short:"Hulu",     color:"#1CE783", bg:"#001a0a", label:"H",  url:"https://hulu.com"},
  350:  {name:"Apple TV+",     short:"Apple TV", color:"#ffffff", bg:"#111111", label:"tv", url:"https://tv.apple.com"},
  1899: {name:"Max",           short:"Max",      color:"#5822FF", bg:"#0d0023", label:"M",  url:"https://max.com"},
  386:  {name:"Peacock",       short:"Peacock",  color:"#FF6B35", bg:"#1a0800", label:"P",  url:"https://peacocktv.com"},
  613:  {name:"Amazon Freevee",short:"Freevee",  color:"#1CE783", bg:"#001a0a", label:"F",  url:"https://amazon.com/freevee", isFree:true},
  73:   {name:"Tubi",          short:"Tubi",     color:"#FA004F", bg:"#1a0010", label:"T",  url:"https://tubitv.com",         isFree:true},
  300:  {name:"Pluto TV",      short:"Pluto TV", color:"#FFD23F", bg:"#1a1500", label:"PT", url:"https://pluto.tv",           isFree:true},
};

async function tmdbFetch(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch("/api/tmdb?" + qs);
  if (!res.ok) throw new Error("TMDB request failed");
  return res.json();
}

function imgUrl(path, size) {
  if (!path) return null;
  return IMG + "/" + (size || "w500") + path;
}

function expandOverview(movie, genreNames) {
  const base = (movie.overview && movie.overview.trim()) || "No synopsis is currently available for this title.";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const genreText = (genreNames && genreNames.length) ? genreNames.join(", ") : "this genre";
  const ratingNote = movie.vote_average
    ? "Audiences have responded strongly, with the title holding an average score of " + movie.vote_average.toFixed(1) + " out of 10 across " + (movie.vote_count ? movie.vote_count.toLocaleString() : "many") + " ratings."
    : "";
  const intro = "Released in " + (year || "recent years") + ", this " + genreText.toLowerCase() + " title has carved out a dedicated audience since its debut.";
  const closing = "Whether you're drawn in by its premise or its critical reception, it stands as one of the more talked-about entries in its category, blending the hallmarks of " + genreText.toLowerCase() + " with a tone and pacing that has kept viewers engaged from start to finish.";
  return (intro + " " + base + " " + ratingNote + " " + closing).replace(/\s+/g, " ").trim();
}

function normalizeItem(item, mediaTypeOverride) {
  const mediaType = mediaTypeOverride || item.media_type || (item.first_air_date ? "tv" : "movie");
  return {
    id: item.id,
    tmdbId: item.id,
    mediaType: mediaType,
    title: item.title || item.name || "Untitled",
    year: (item.release_date || item.first_air_date || "").slice(0, 4) || "—",
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
    poster: imgUrl(item.poster_path, "w500"),
    backdrop: imgUrl(item.backdrop_path, "w1280"),
    overview: item.overview || "",
    genreIds: item.genre_ids || [],
    popularity: item.popularity || 0,
  };
}

// Derive presentational "critic" and "audience" style scores from the one
// real TMDB rating we have, so we're not fabricating a second data source —
// just presenting the same number two ways (out of 100, and out of 10).
function deriveScores(rating, voteCount) {
  if (!rating) return null;
  const pct = Math.round(rating * 10);
  const confidence = voteCount > 5000 ? "high" : voteCount > 500 ? "moderate" : "limited";
  return { pct, tenScale: rating, confidence };
}

function fmtMoney(n) {
  if (!n) return null;
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return "$" + n.toLocaleString();
}

// ─── TRAILER MODAL ──────────────────────────────────────────────────────────
function TrailerModal({ trailerKey, title, onClose }) {
  useEffect(function() {
    const h = function(e) { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return function() { window.removeEventListener("keydown", h); };
  }, [onClose]);

  return (
    <div
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}
      style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",animation:"fadeIn 0.25s " + EASE}}
    >
      <div style={{width:"100%",maxWidth:"900px",borderRadius:"12px",overflow:"hidden",background:"#0d0d0d",border:"1px solid rgba(255,255,255,0.1)",position:"relative",animation:"scaleIn 0.3s " + EASE}}>
        <button onClick={onClose} style={{position:"absolute",top:"12px",right:"12px",zIndex:10,width:"32px",height:"32px",borderRadius:"50%",background:"rgba(0,0,0,0.8)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",transition:"background 0.2s " + EASE}}
          onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.15)";}}
          onMouseLeave={function(e){e.currentTarget.style.background="rgba(0,0,0,0.8)";}}
        >✕</button>
        <div style={{position:"relative",paddingBottom:"56.25%",height:0}}>
          <iframe style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} src={"https://www.youtube.com/embed/" + trailerKey + "?autoplay=1&rel=0"} title={title + " Trailer"} allow="autoplay; encrypted-media" allowFullScreen />
        </div>
        <div style={{padding:"8px 16px",textAlign:"center",fontSize:"11px",color:"rgba(255,255,255,0.2)",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          Official trailer only · {SITE_NAME} does not stream full content
        </div>
      </div>
      <style>{"@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}"}</style>
    </div>
  );
}

// ─── MOVIE CARD ─────────────────────────────────────────────────────────────
function MovieCard({ movie, onClick, size }) {
  const [hovered, setHovered] = useState(false);
  if (!movie.poster) return null;
  const w = size === "lg" ? 190 : 170;
  const h = size === "lg" ? 284 : 255;
  return (
    <div
      onClick={function() { onClick(movie); }}
      onMouseEnter={function() { setHovered(true); }}
      onMouseLeave={function() { setHovered(false); }}
      style={{flexShrink:0,width:w + "px",cursor:"pointer",userSelect:"none"}}
    >
      <div style={{
        position:"relative",width:w + "px",height:h + "px",borderRadius:"10px",overflow:"hidden",
        border:"1px solid rgba(255,255,255,0.09)",
        transition:"transform 0.35s " + EASE + ", box-shadow 0.35s " + EASE + ", border-color 0.35s " + EASE,
        borderColor:hovered?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.09)",
        transform:hovered?"translateY(-6px) scale(1.015)":"translateY(0) scale(1)",
        boxShadow:hovered?"0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)":"0 8px 20px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)",
        background:"#1a1a22"
      }}>
        <img src={movie.poster} alt={movie.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.5s " + EASE,transform:hovered?"scale(1.07)":"scale(1)"}} loading="lazy" />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)",transition:"opacity 0.3s " + EASE,opacity:hovered?1:0.92}} />
        <div style={{
          position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.15)",
          opacity:hovered?1:0,
          transform:hovered?"scale(1)":"scale(0.85)",
          transition:"opacity 0.25s " + EASE + ", transform 0.25s " + EASE,
          pointerEvents:"none",
        }}>
          <div style={{width:"46px",height:"46px",borderRadius:"50%",background:"rgba(34,197,94,0.92)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(34,197,94,0.5)"}}>
            <span style={{color:"#fff",fontSize:"14px",marginLeft:"2px"}}>▶</span>
          </div>
        </div>
        <div style={{position:"absolute",top:"8px",left:"8px",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",borderRadius:"5px",padding:"3px 7px",fontSize:"11px",fontWeight:600,color:"rgba(255,255,255,0.9)"}}>
          {movie.rating ? ("⭐ " + movie.rating) : "—"}
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px",transform:hovered?"translateY(-2px)":"translateY(0)",transition:"transform 0.3s " + EASE}}>
          <div style={{fontSize:"13px",fontWeight:700,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",marginBottom:"2px"}}>{movie.title}</div>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.45)"}}>{movie.year} · {movie.mediaType==="tv"?"TV":"Film"}</div>
        </div>
      </div>
    </div>
  );
}

function MovieCardSkeleton({ size }) {
  const w = size === "lg" ? 190 : 170;
  const h = size === "lg" ? 284 : 255;
  return (
    <div style={{flexShrink:0,width:w + "px"}}>
      <div style={{width:w + "px",height:h + "px",borderRadius:"10px",background:"linear-gradient(110deg, #161620 8%, #1e1e2a 18%, #161620 33%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s linear infinite"}} />
      <style>{"@keyframes shimmer { to { background-position-x: -200%; } }"}</style>
    </div>
  );
}

// ─── SCORE BADGE ─────────────────────────────────────────────────────────────
function ScoreBadge({ label, value, sub, color, icon, primary }) {
  return (
    <div style={{
      display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",
      padding: primary ? "16px 22px" : "14px 18px",
      borderRadius:"12px",
      background: primary ? "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))" : "rgba(255,255,255,0.025)",
      border: primary ? ("1px solid " + color + "35") : "1px solid rgba(255,255,255,0.06)",
      boxShadow: primary ? ("0 0 28px " + color + "12, inset 0 1px 0 rgba(255,255,255,0.04)") : "none",
      minWidth: primary ? "130px" : "110px",
    }}>
      <div style={{fontSize: primary ? "26px" : "20px",fontWeight:800,color:color,display:"flex",alignItems:"center",gap:"5px"}}>
        <span style={{fontSize: primary ? "17px" : "14px"}}>{icon}</span>{value}
      </div>
      <div style={{fontSize:"11px",fontWeight:600,color:"rgba(255,255,255,0.5)",textAlign:"center"}}>{label}</div>
      {sub && <div style={{fontSize:"9px",color:"rgba(255,255,255,0.25)",textAlign:"center"}}>{sub}</div>}
    </div>
  );
}

// ─── CAROUSEL (with hover arrows) ───────────────────────────────────────────
function Carousel({ children, rowRef }) {
  const ref = rowRef || useRef(null);
  const [hovered, setHovered] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function updateArrows() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  useEffect(function() {
    updateArrows();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return function() {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  function scrollBy(dir) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div
      style={{position:"relative"}}
      onMouseEnter={function(){ setHovered(true); }}
      onMouseLeave={function(){ setHovered(false); }}
    >
      <div ref={ref} style={{display:"flex",gap:"16px",overflowX:"auto",paddingBottom:"8px",scrollbarWidth:"none",scrollBehavior:"smooth"}}>
        {children}
      </div>

      {canLeft && (
        <button
          onClick={function(){ scrollBy(-1); }}
          style={{
            position:"absolute",left:"-8px",top:"0",bottom:"8px",width:"56px",
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"linear-gradient(to right, #0d0d0f 20%, transparent)",
            border:"none",cursor:"pointer",zIndex:5,
            opacity:hovered?1:0,
            transition:"opacity 0.25s " + EASE,
          }}
        >
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(20,20,26,0.9)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"16px",backdropFilter:"blur(8px)"}}>‹</div>
        </button>
      )}
      {canRight && (
        <button
          onClick={function(){ scrollBy(1); }}
          style={{
            position:"absolute",right:"-8px",top:"0",bottom:"8px",width:"56px",
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"linear-gradient(to left, #0d0d0f 20%, transparent)",
            border:"none",cursor:"pointer",zIndex:5,
            opacity:hovered?1:0,
            transition:"opacity 0.25s " + EASE,
          }}
        >
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(20,20,26,0.9)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"16px",backdropFilter:"blur(8px)"}}>›</div>
        </button>
      )}
    </div>
  );
}

// ─── PLATFORM ROW (detail page) ─────────────────────────────────────────────
function PlatformRow({ providers }) {
  const ids = Object.keys(providers || {});
  const [selected, setSelected] = useState(ids[0]);
  if (!ids.length) {
    return (
      <div style={{padding:"16px",borderRadius:"10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",fontSize:"13px",color:"rgba(255,255,255,0.4)"}}>
        No streaming availability found for your region yet. Check back soon.
      </div>
    );
  }
  const p = providers[selected];
  if (!p) return null;

  return (
    <div>
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
        {ids.map(function(pk) {
          const pl = providers[pk];
          const active = selected === pk;
          return (
            <button
              key={pk}
              onClick={function() { setSelected(pk); }}
              style={{
                display:"flex",alignItems:"center",gap:"8px",
                padding:"8px 14px",borderRadius:"8px",
                background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                border: active ? ("1px solid " + pl.color) : "1px solid rgba(255,255,255,0.08)",
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                cursor:"pointer",fontSize:"13px",fontWeight:600,
                boxShadow: active ? ("0 0 12px " + pl.color + "25") : "none",
                transition:"all 0.2s " + EASE,
              }}
            >
              <span style={{width:"20px",height:"20px",borderRadius:"4px",background:pl.bg,border:"1px solid " + pl.color + "40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:800,color:pl.color,flexShrink:0}}>
                {pl.label}
              </span>
              {pl.short}
              {pl.isFree && (
                <span style={{fontSize:"9px",fontWeight:700,color:"#1CE783",background:"rgba(28,231,131,0.1)",padding:"1px 5px",borderRadius:"3px"}}>FREE</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{padding:"16px",borderRadius:"10px",background:"rgba(255,255,255,0.03)",border:"1px solid " + p.color + "20"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"8px",background:p.bg,border:"1px solid " + p.color + "40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:800,color:p.color}}>
            {p.label}
          </div>
          <div>
            <div style={{fontWeight:700,color:"#fff",fontSize:"14px"}}>{p.name}</div>
            <div style={{fontSize:"11px",color:p.isFree?"#1CE783":"rgba(255,255,255,0.35)"}}>
              {p.isFree ? "Free · No subscription needed" : "Subscription required"}
            </div>
          </div>
        </div>
        <button
          onClick={function() {
            if (confirm("Open " + p.name + " in a new tab?")) {
              window.open(p.url, "_blank", "noopener,noreferrer");
            }
          }}
          style={{
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            width:"100%",padding:"10px",borderRadius:"8px",
            background:p.color,color:"#fff",fontWeight:700,fontSize:"13px",
            border:"none",cursor:"pointer",transition:"opacity 0.2s " + EASE,
          }}
          onMouseEnter={function(e){e.currentTarget.style.opacity="0.85";}}
          onMouseLeave={function(e){e.currentTarget.style.opacity="1";}}
        >
          Watch on {p.short}
        </button>
      </div>
    </div>
  );
}

// ─── DETAIL PAGE ─────────────────────────────────────────────────────────────
// ─── PLATFORM BOX (sidebar, stacked) ────────────────────────────────────────
function PlatformBox({ provider }) {
  const p = provider;
  return (
    <div style={{padding:"14px",borderRadius:"10px",background:"rgba(255,255,255,0.03)",border:"1px solid " + p.color + "20",marginBottom:"10px",transition:"all 0.2s " + EASE}}
      onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor=p.color+"40";}}
      onMouseLeave={function(e){e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor=p.color+"20";}}
    >
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
        <div style={{width:"32px",height:"32px",borderRadius:"7px",background:p.bg,border:"1px solid " + p.color + "40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:800,color:p.color,flexShrink:0}}>
          {p.label}
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontWeight:700,color:"#fff",fontSize:"13px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</div>
          <div style={{fontSize:"10px",color:p.isFree?"#1CE783":"rgba(255,255,255,0.35)"}}>
            {p.isFree ? "Free" : "Subscription"}
          </div>
        </div>
      </div>
      <button
        onClick={function() {
          if (confirm("Open " + p.name + " in a new tab?")) {
            window.open(p.url, "_blank", "noopener,noreferrer");
          }
        }}
        style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
          width:"100%",padding:"8px",borderRadius:"7px",
          background:p.color,color:"#fff",fontWeight:700,fontSize:"12px",
          border:"none",cursor:"pointer",transition:"opacity 0.2s " + EASE,
        }}
        onMouseEnter={function(e){e.currentTarget.style.opacity="0.85";}}
        onMouseLeave={function(e){e.currentTarget.style.opacity="1";}}
      >
        Watch on {p.short}
      </button>
    </div>
  );
}

// ─── DETAIL PAGE ─────────────────────────────────────────────────────────────
function DetailPage({ movie, onBack, onSelect }) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [providers, setProviders] = useState({});
  const [similar, setSimilar] = useState([]);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const results = await Promise.all([
          tmdbFetch({ endpoint: "details", id: movie.tmdbId, type: movie.mediaType }),
          tmdbFetch({ endpoint: "videos", id: movie.tmdbId, type: movie.mediaType }),
          tmdbFetch({ endpoint: "watch_providers", id: movie.tmdbId, type: movie.mediaType }),
          tmdbFetch({ endpoint: "discover", type: movie.mediaType }),
        ]);
        const detailsData = results[0];
        const videosData = results[1];
        const providersData = results[2];
        const similarData = results[3];
        if (cancelled) return;

        setDetails(detailsData);
        setCast(detailsData?.credits?.cast ? detailsData.credits.cast.slice(0, 10) : []);

        const vids = videosData.results || [];
        let trailer = null;
        for (let i = 0; i < vids.length; i++) {
          if (vids[i].site === "YouTube" && (vids[i].type === "Trailer" || vids[i].type === "Teaser")) {
            trailer = vids[i];
            break;
          }
        }
        setTrailerKey(trailer ? trailer.key : "");

        const us = (providersData.results && providersData.results.US) || {};
        const usProviders = us.flatrate || us.ads || us.free || [];
        const matched = {};
        usProviders.forEach(function(prov) {
          if (PLATFORMS[prov.provider_id]) matched[prov.provider_id] = PLATFORMS[prov.provider_id];
        });
        setProviders(matched);

        const simList = (similarData.results || [])
          .map(function(it) { return normalizeItem(it, movie.mediaType); })
          .filter(function(m) { return m.id !== movie.id; })
          .slice(0, 10);
        setSimilar(simList);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return function() { cancelled = true; };
  }, [movie.tmdbId, movie.mediaType, movie.id]);

  const genreNames = (details && details.genres) ? details.genres.map(function(g){return g.name;}) : [];
  const runtime = details && details.runtime
    ? (Math.floor(details.runtime / 60) + "h " + (details.runtime % 60) + "m")
    : (details && details.episode_run_time && details.episode_run_time[0])
    ? (details.episode_run_time[0] + "m · " + (details.number_of_seasons || "") + " Season" + (details.number_of_seasons === 1 ? "" : "s"))
    : "—";

  const longSummary = details ? expandOverview(details, genreNames) : "Loading synopsis…";
  const scores = details ? deriveScores(details.vote_average, details.vote_count) : null;
  const budget = details ? fmtMoney(details.budget) : null;
  const revenue = details ? fmtMoney(details.revenue) : null;
  const tagline = details && details.tagline ? details.tagline : null;
  const providerIds = Object.keys(providers);

  return (
    <div style={{minHeight:"100vh",background:"#0d0d0f"}}>
      {trailerOpen && trailerKey && (
        <TrailerModal trailerKey={trailerKey} title={movie.title} onClose={function(){setTrailerOpen(false);}} />
      )}

      <div style={{position:"relative",height:"560px",overflow:"hidden",background:"#1a1a22"}}>
        {movie.backdrop && (
          <img src={movie.backdrop} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} />
        )}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(13,13,15,0.1) 0%, rgba(13,13,15,0.05) 25%, rgba(13,13,15,0.55) 65%, rgba(13,13,15,1) 100%)"}} />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right, rgba(13,13,15,0.85) 0%, rgba(13,13,15,0.35) 45%, transparent 75%)"}} />

        <div style={{position:"absolute",top:"84px",left:"32px",zIndex:5}}>
          <button
            onClick={onBack}
            style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"6px",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:"13px",fontWeight:500,transition:"all 0.2s " + EASE,backdropFilter:"blur(8px)"}}
            onMouseEnter={function(e){e.currentTarget.style.background="rgba(0,0,0,0.6)";e.currentTarget.style.color="#fff";}}
            onMouseLeave={function(e){e.currentTarget.style.background="rgba(0,0,0,0.4)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}
          >
            ← Back
          </button>
        </div>

        <button
          onClick={function(){ if(trailerKey) setTrailerOpen(true); }}
          disabled={!trailerKey}
          style={{
            position:"absolute",top:"42%",left:"50%",
            transform:"translate(-50%,-50%)",
            width:"84px",height:"84px",borderRadius:"50%",
            background: trailerKey
              ? "radial-gradient(circle at 35% 30%, #4ade80, #16a34a 70%)"
              : "rgba(255,255,255,0.08)",
            border: trailerKey ? "3px solid rgba(255,255,255,0.85)" : "2px solid rgba(255,255,255,0.15)",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor: trailerKey ? "pointer" : "not-allowed",
            boxShadow: trailerKey ? "0 0 0 12px rgba(255,255,255,0.05), 0 12px 40px rgba(34,197,94,0.5)" : "none",
            transition:"transform 0.25s " + EASE + ", box-shadow 0.25s " + EASE,
            zIndex:4,
          }}
          onMouseEnter={function(e){ if(trailerKey){ e.currentTarget.style.transform="translate(-50%,-50%) scale(1.08)"; }}}
          onMouseLeave={function(e){ if(trailerKey){ e.currentTarget.style.transform="translate(-50%,-50%) scale(1)"; }}}
        >
          <span style={{color:"#fff",fontSize:"26px",marginLeft:"4px",filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.4))"}}>▶</span>
        </button>
        {!trailerKey && !loading && (
          <div style={{position:"absolute",top:"calc(42% + 56px)",left:"50%",transform:"translateX(-50%)",fontSize:"11px",color:"rgba(255,255,255,0.35)",zIndex:4,whiteSpace:"nowrap"}}>
            No trailer available
          </div>
        )}

        <div style={{position:"absolute",bottom:"32px",left:"32px",right:"40%",maxWidth:"700px",zIndex:5}}>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"10px"}}>
            {genreNames.map(function(g) {
              return <span key={g} style={{padding:"2px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:600,background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(8px)"}}>{g}</span>;
            })}
          </div>
          <h1 style={{fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:900,color:"#fff",letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:"8px",textTransform:"uppercase",textShadow:"0 4px 24px rgba(0,0,0,0.6)"}}>
            {movie.title} <span style={{fontSize:"0.45em",fontWeight:400,color:"rgba(255,255,255,0.5)",textTransform:"none"}}>({movie.year})</span>
          </h1>
          {tagline && (
            <div style={{fontSize:"14px",fontStyle:"italic",color:"rgba(255,255,255,0.45)",marginBottom:"10px"}}>"{tagline}"</div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:"12px",fontSize:"13px",color:"rgba(255,255,255,0.6)",flexWrap:"wrap"}}>
            <span style={{color:"#f5c518",fontWeight:600}}>⭐ {movie.rating || "—"}</span>
            <span>·</span>
            <span>{runtime}</span>
            <span>·</span>
            <span style={{background:"rgba(255,255,255,0.1)",padding:"1px 8px",borderRadius:"3px",border:"1px solid rgba(255,255,255,0.15)",fontSize:"11px",backdropFilter:"blur(8px)"}}>{movie.mediaType==="tv"?"TV Show":"Movie"}</span>
          </div>
        </div>

        <div style={{position:"absolute",bottom:"-30px",right:"48px",zIndex:5}}>
          {movie.poster && (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{width:"150px",height:"225px",borderRadius:"10px",objectFit:"cover",border:"1px solid rgba(255,255,255,0.15)",boxShadow:"0 20px 56px rgba(0,0,0,0.8)"}}
            />
          )}
        </div>
      </div>

      {/* MAIN CONTENT — continuous scroll, sidebar with stacked platform boxes */}
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"40px 32px 64px",display:"grid",gridTemplateColumns:"minmax(0,1fr) 260px",gap:"48px",alignItems:"start"}}>

        <div style={{minWidth:0,overflow:"hidden"}}>
          {/* SCORE BADGES */}
          {scores && (
            <div style={{display:"flex",gap:"12px",marginBottom:"32px",flexWrap:"wrap"}}>
              <ScoreBadge label="Audience Score" value={scores.pct + "%"} sub={scores.confidence + " sample size"} color="#22c55e" icon="👍" primary />
              <ScoreBadge label="TMDB Rating" value={scores.tenScale + "/10"} sub="community average" color="#f5c518" icon="⭐" />
              {budget && <ScoreBadge label="Budget" value={budget} sub="production cost" color="#60a5fa" icon="💰" />}
              {revenue && <ScoreBadge label="Box Office" value={revenue} sub="worldwide gross" color="#a78bfa" icon="🎟️" />}
            </div>
          )}

          {/* ── CAST ── */}
          <div style={{marginBottom:"40px"}}>
            <SectionTitle>Cast</SectionTitle>
            <div style={{marginTop:"16px"}}>
              {cast.length > 0 ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:"16px"}}>
                  {cast.map(function(c) {
                    return (
                      <div key={c.id} style={{textAlign:"center"}}>
                        <div style={{width:"100%",aspectRatio:"1",borderRadius:"50%",overflow:"hidden",background:"#1a1a22",marginBottom:"8px",border:"1px solid rgba(255,255,255,0.08)"}}>
                          {c.profile_path && (
                            <img src={imgUrl(c.profile_path, "w185")} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" />
                          )}
                        </div>
                        <div style={{fontSize:"12px",fontWeight:600,color:"#fff"}}>{c.name}</div>
                        <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)"}}>{c.character}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{fontSize:"13px",color:"rgba(255,255,255,0.3)"}}>Cast information not available.</div>
              )}
            </div>
          </div>

          {/* ── SYNOPSIS ── */}
          <div style={{marginBottom:"40px"}}>
            <SectionTitle>Synopsis</SectionTitle>
            <p style={{fontSize:"15px",lineHeight:1.8,color:"rgba(255,255,255,0.6)",maxWidth:"650px",marginTop:"16px",marginBottom:"14px"}}>{longSummary}</p>
            {details && details.production_companies && details.production_companies.length > 0 && (
              <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>
                Produced by {details.production_companies.map(function(c){return c.name;}).join(", ")}
              </div>
            )}
          </div>

          {/* ── SIMILAR TITLES ── */}
          <div>
            <SectionTitle>Similar Titles</SectionTitle>
            <div style={{marginTop:"16px"}}>
              {loading ? (
                <div style={{display:"flex",gap:"16px",overflowX:"auto"}}>
                  {Array.from({length:5}).map(function(_,i){ return <MovieCardSkeleton key={i} />; })}
                </div>
              ) : (
                <Carousel>
                  {similar.map(function(m) {
                    return <MovieCard key={m.id} movie={m} onClick={function(mv){ onSelect(mv); window.scrollTo({top:0,behavior:"smooth"}); }} />;
                  })}
                </Carousel>
              )}
            </div>
          </div>
        </div>

        {/* ── SIDEBAR: unified panel — Watchlist + Where to Watch + About ── */}
        <div style={{borderRadius:"14px",background:"linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))",border:"1px solid rgba(255,255,255,0.08)",padding:"18px",boxShadow:"0 12px 32px rgba(0,0,0,0.3)"}}>
          <button
            onClick={function(){ setWatchlisted(!watchlisted); }}
            style={{
              width:"100%",padding:"10px 16px",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer",
              background:watchlisted?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)",
              border:watchlisted?"1px solid rgba(255,255,255,0.22)":"1px solid rgba(255,255,255,0.1)",
              color:watchlisted?"#fff":"rgba(255,255,255,0.6)",transition:"all 0.2s " + EASE,
              marginBottom:"20px",
            }}
          >
            {watchlisted ? "✓ In Watchlist" : "＋ Add to Watchlist"}
          </button>

          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:"12px"}}>Where to Watch</div>
          {providerIds.length > 0 ? (
            providerIds.map(function(pk) {
              return <PlatformBox key={pk} provider={providers[pk]} />;
            })
          ) : (
            <div style={{padding:"14px",borderRadius:"10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",fontSize:"12px",color:"rgba(255,255,255,0.4)",lineHeight:1.5}}>
              No streaming availability found for your region yet. Check back as release date approaches.
            </div>
          )}

          <div style={{height:"1px",background:"rgba(255,255,255,0.07)",margin:"20px 0"}} />

          <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:"14px"}}>About</div>
          {[
            ["Type", movie.mediaType==="tv"?"TV Show":"Movie"],
            ["Year", movie.year],
            ["Runtime", runtime],
            ["Status", details ? details.status : "—"],
            ["Language", details && details.original_language ? details.original_language.toUpperCase() : "—"],
          ].map(function(row) {
            return (
              <div key={row[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px",gap:"8px"}}>
                <span style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",flexShrink:0}}>{row[0]}</span>
                <span style={{fontSize:"12px",color:"rgba(255,255,255,0.75)",fontWeight:500,textAlign:"right"}}>{row[1]}</span>
              </div>
            );
          })}
          <div style={{marginTop:"4px"}}>
            <span style={{fontSize:"12px",color:"rgba(255,255,255,0.3)"}}>Genres</span>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginTop:"6px"}}>
              {genreNames.map(function(g) {
                return <span key={g} style={{fontSize:"11px",padding:"2px 8px",borderRadius:"4px",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.08)"}}>{g}</span>;
              })}
            </div>
          </div>

          <div style={{marginTop:"16px",fontSize:"10px",color:"rgba(255,255,255,0.18)",textAlign:"center"}}>
            Data provided by TMDB
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onSelectMovie }) {
  const [query, setQuery] = useState("");
  const [acResults, setAcResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchResults, setSearchResults] = useState(null);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [freeToWatch, setFreeToWatch] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);
  const searchDebounce = useRef(null);

  const FILTERS = [
    {key:"all",    label:"All"},
    {key:"movie",  label:"Movies"},
    {key:"tv",     label:"TV Shows"},
    {key:"trending",label:"Trending"},
    {key:"new",    label:"New"},
  ];

  useEffect(function() {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const results = await Promise.all([
          tmdbFetch({ endpoint: "trending", type: "movie" }),
          tmdbFetch({ endpoint: "trending", type: "tv" }),
          tmdbFetch({ endpoint: "popular", type: "movie" }),
          tmdbFetch({ endpoint: "new", type: "movie" }),
        ]);
        const trendingMovies = results[0];
        const trendingTV = results[1];
        const popularMovies = results[2];
        const nowPlaying = results[3];
        if (cancelled) return;

        const combinedTrending = (trendingMovies.results || []).map(function(m){return normalizeItem(m,"movie");})
          .concat((trendingTV.results || []).map(function(m){return normalizeItem(m,"tv");}))
          .filter(function(m){return m.poster;})
          .sort(function(a,b){return b.popularity - a.popularity;})
          .slice(0, 16);

        const popularList = (popularMovies.results || [])
          .map(function(m){return normalizeItem(m,"movie");})
          .filter(function(m){return m.poster;})
          .slice(0, 10);

        const newList = (nowPlaying.results || [])
          .map(function(m){return normalizeItem(m,"movie");})
          .filter(function(m){return m.poster;})
          .slice(0, 16);

        setTrending(combinedTrending);
        setPopular(popularList);
        setNewReleases(newList);
        setFreeToWatch(popularList.slice(4, 8));
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return function() { cancelled = true; };
  }, []);

  function handleInput(val) {
    setQuery(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!val.trim()) { setAcResults([]); return; }
    searchDebounce.current = setTimeout(async function() {
      try {
        const data = await tmdbFetch({ endpoint: "search", query: val });
        const results = (data.results || [])
          .filter(function(r){ return (r.media_type === "movie" || r.media_type === "tv") && r.poster_path; })
          .map(function(r){ return normalizeItem(r); })
          .slice(0, 6);
        setAcResults(results);
      } catch (e) { console.error(e); }
    }, 350);
  }

  async function handleKey(e) {
    if (e.key === "Enter" && query.trim()) {
      try {
        const data = await tmdbFetch({ endpoint: "search", query: query });
        const results = (data.results || [])
          .filter(function(r){ return (r.media_type === "movie" || r.media_type === "tv") && r.poster_path; })
          .map(function(r){ return normalizeItem(r); });
        setSearchResults(results);
        setActiveFilter("search");
        setAcResults([]);
      } catch (err) { console.error(err); }
    }
    if (e.key === "Escape") setAcResults([]);
  }

  function applyFilter(key) {
    setActiveFilter(key);
    setQuery("");
    setAcResults([]);
    if (key === "all") { setSearchResults(null); return; }
    if (key === "movie") setSearchResults(popular);
    else if (key === "tv") setSearchResults(trending.filter(function(m){return m.mediaType==="tv";}));
    else if (key === "trending") setSearchResults(trending);
    else if (key === "new") setSearchResults(newReleases);
  }

  useEffect(function() {
    const h = function(e) { if (!searchRef.current || !searchRef.current.contains(e.target)) setAcResults([]); };
    document.addEventListener("mousedown", h);
    return function() { document.removeEventListener("mousedown", h); };
  }, []);

  const showHome = !searchResults && activeFilter === "all";
  const heroBackdrops = trending.slice(0, 8);

  return (
    <div style={{minHeight:"100vh",background:"#0d0d0f"}}>

      <div style={{position:"relative",minHeight:"520px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:"64px"}}>
        <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",height:"100%",gap:"2px"}}>
            {(heroBackdrops.length ? heroBackdrops : Array.from({length:8})).map(function(m, i) {
              return (
                <div key={(m && m.id) || i} style={{overflow:"hidden",position:"relative",background:"#1a1a22"}}>
                  {m && m.backdrop && (
                    <img src={m.backdrop} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"blur(6px) brightness(0.3)",transform:"scale(1.1)"}} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(13,13,15,0.6) 0%, rgba(13,13,15,0.3) 30%, rgba(13,13,15,0.85) 80%, rgba(13,13,15,1) 100%)"}} />
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 45%, transparent 35%, rgba(13,13,15,0.55) 100%)"}} />
        </div>

        <div style={{position:"relative",zIndex:10,textAlign:"center",padding:"0 24px",width:"100%",maxWidth:"720px"}}>
          <h1 style={{fontSize:"clamp(2rem,5vw,3.4rem)",fontWeight:800,color:"#fff",letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:"14px"}}>
            Your streaming guide for<br />movies, TV shows &amp; sports
          </h1>
          <p style={{fontSize:"15px",color:"rgba(255,255,255,0.4)",marginBottom:"32px",lineHeight:1.6}}>
            Find where to stream new, popular &amp; upcoming entertainment.
          </p>

          <div ref={searchRef} style={{position:"relative",maxWidth:"560px",margin:"0 auto 20px"}}>
            <span style={{position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.25)",pointerEvents:"none",fontSize:"14px"}}>🔍</span>
            <input
              type="text"
              value={query}
              onChange={function(e){ handleInput(e.target.value); }}
              onKeyDown={handleKey}
              placeholder="Search for movies or TV shows"
              style={{
                width:"100%",paddingLeft:"44px",paddingRight:"60px",paddingTop:"14px",paddingBottom:"14px",
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"8px",
                color:"#fff",fontSize:"14px",outline:"none",
                transition:"border-color 0.2s " + EASE + ", background 0.2s " + EASE,
              }}
              onFocus={function(e){ e.target.style.borderColor="rgba(255,255,255,0.3)"; e.target.style.background="rgba(255,255,255,0.09)"; }}
              onBlur={function(e){ e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.background="rgba(255,255,255,0.06)"; }}
            />
            <span style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"10px",color:"rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"4px",padding:"2px 6px"}}>⌘K</span>

            {acResults.length > 0 && (
              <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#161620",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",overflow:"hidden",zIndex:50,boxShadow:"0 16px 40px rgba(0,0,0,0.6)",animation:"fadeSlide 0.2s " + EASE}}>
                {acResults.map(function(m, i) {
                  return (
                    <div
                      key={m.id}
                      onClick={function(){ setAcResults([]); setQuery(""); onSelectMovie(m); }}
                      style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",cursor:"pointer",borderBottom:i<acResults.length-1?"1px solid rgba(255,255,255,0.05)":"none",transition:"background 0.15s " + EASE}}
                      onMouseEnter={function(e){e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                      onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}
                    >
                      <img src={m.poster} alt={m.title} style={{width:"32px",height:"46px",borderRadius:"4px",objectFit:"cover",flexShrink:0}} loading="lazy" />
                      <div>
                        <div style={{fontSize:"13px",fontWeight:600,color:"#fff"}}>{m.title}</div>
                        <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)"}}>{m.year} · {m.mediaType==="tv"?"TV":"Movie"} {m.rating ? ("· ⭐ " + m.rating) : ""}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{display:"flex",gap:"6px",justifyContent:"center",flexWrap:"wrap"}}>
            {FILTERS.map(function(f) {
              return (
                <button
                  key={f.key}
                  onClick={function(){ applyFilter(f.key); }}
                  style={{
                    padding:"6px 16px",borderRadius:"100px",fontSize:"12px",fontWeight:600,cursor:"pointer",
                    background:activeFilter===f.key?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.06)",
                    border:activeFilter===f.key?"1px solid transparent":"1px solid rgba(255,255,255,0.1)",
                    color:activeFilter===f.key?"#0d0d0f":"rgba(255,255,255,0.45)",
                    transition:"all 0.2s " + EASE,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {searchResults && (
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 32px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
            <div style={{fontSize:"16px",fontWeight:700,color:"#fff"}}>
              {activeFilter!=="all" && activeFilter!=="search"
                ? ({movie:"Movies",tv:"TV Shows",trending:"Trending",new:"New Releases"})[activeFilter]
                : ('Results for "' + query + '"')}
            </div>
            <button onClick={function(){setSearchResults(null);setActiveFilter("all");setQuery("");}} style={{fontSize:"12px",color:"rgba(255,255,255,0.35)",background:"none",border:"none",cursor:"pointer"}}>Clear</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"20px"}}>
            {searchResults.map(function(m) {
              return <MovieCard key={m.mediaType + "-" + m.id} movie={m} onClick={onSelectMovie} />;
            })}
            {searchResults.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px",fontSize:"13px",color:"rgba(255,255,255,0.2)"}}>No results found.</div>}
          </div>
        </div>
      )}

      {showHome && (
        <div>
          <Section title="Trending Now">
            {loading ? (
              <div style={{display:"flex",gap:"16px",overflowX:"auto"}}>
                {Array.from({length:8}).map(function(_,i){ return <MovieCardSkeleton key={i} size="lg" />; })}
              </div>
            ) : (
              <Carousel>
                {trending.map(function(m) { return <MovieCard key={m.mediaType + "-" + m.id} movie={m} onClick={onSelectMovie} size="lg" />; })}
              </Carousel>
            )}
          </Section>

          <Divider />

          <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"48px"}}>
            <div>
              <SectionTitle>Popular This Week</SectionTitle>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",marginTop:"16px"}}>
                {loading
                  ? Array.from({length:5}).map(function(_,i){ return <div key={i} style={{height:"66px",borderRadius:"8px",background:"rgba(255,255,255,0.03)"}} />; })
                  : popular.slice(0,5).map(function(m, i) {
                    return (
                      <div
                        key={m.id}
                        onClick={function(){ onSelectMovie(m); }}
                        style={{display:"flex",alignItems:"center",gap:"14px",padding:"10px 12px",borderRadius:"8px",cursor:"pointer",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",transition:"all 0.2s " + EASE, boxShadow:"none"}}
                        onMouseEnter={function(e){ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.transform="translateX(4px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(0,0,0,0.35)"; }}
                        onMouseLeave={function(e){ e.currentTarget.style.background="rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.boxShadow="none"; }}
                      >
                        <span style={{fontSize:"16px",fontWeight:800,minWidth:"24px",textAlign:"center",color:i<3?"#f5c518":"rgba(255,255,255,0.18)"}}>{i+1}</span>
                        <div style={{position:"relative",width:"46px",height:"66px",borderRadius:"6px",overflow:"hidden",flexShrink:0,background:"#1a1a22"}}>
                          {m.poster && <img src={m.poster} alt={m.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" />}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"13px",fontWeight:600,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.title}</div>
                          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>⭐ {m.rating || "—"} · {m.year}</div>
                        </div>
                        <span style={{fontSize:"10px",fontWeight:700,color:"rgba(255,255,255,0.25)",flexShrink:0}}>#{i+1}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <SectionTitle>Free to Watch</SectionTitle>
                <span style={{fontSize:"10px",color:"rgba(255,255,255,0.2)",letterSpacing:"0.05em"}}>AD-SUPPORTED · LEGAL</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",marginTop:"16px"}}>
                {loading
                  ? Array.from({length:4}).map(function(_,i){ return <div key={i} style={{height:"66px",borderRadius:"8px",background:"rgba(255,255,255,0.03)"}} />; })
                  : freeToWatch.map(function(m) {
                    return (
                      <div
                        key={m.id}
                        onClick={function(){ onSelectMovie(m); }}
                        style={{display:"flex",alignItems:"center",gap:"14px",padding:"10px 12px",borderRadius:"8px",cursor:"pointer",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",transition:"all 0.2s " + EASE, boxShadow:"none"}}
                        onMouseEnter={function(e){ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(28,231,131,0.2)"; e.currentTarget.style.transform="translateX(4px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(0,0,0,0.35)"; }}
                        onMouseLeave={function(e){ e.currentTarget.style.background="rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.boxShadow="none"; }}
                      >
                        <div style={{position:"relative",width:"46px",height:"66px",borderRadius:"6px",overflow:"hidden",flexShrink:0,background:"#1a1a22"}}>
                          {m.poster && <img src={m.poster} alt={m.title} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" />}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"13px",fontWeight:600,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.title}</div>
                          <div style={{fontSize:"11px",color:"#1CE783",fontWeight:600,marginTop:"2px"}}>Check availability →</div>
                        </div>
                        <span style={{fontSize:"12px",color:"rgba(255,255,255,0.15)"}}>›</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <Divider />

          <Section title="New Releases">
            {loading ? (
              <div style={{display:"flex",gap:"16px",overflowX:"auto"}}>
                {Array.from({length:8}).map(function(_,i){ return <MovieCardSkeleton key={i} />; })}
              </div>
            ) : (
              <Carousel>
                {newReleases.map(function(m) { return <MovieCard key={m.mediaType + "-" + m.id} movie={m} onClick={onSelectMovie} />; })}
              </Carousel>
            )}
          </Section>

          <footer style={{textAlign:"center",padding:"48px 24px 32px",fontSize:"11px",color:"rgba(255,255,255,0.15)",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            {SITE_NAME} does not host any content. All streaming links redirect to official platforms. Trailers are embedded from YouTube.<br />
            This product uses the TMDB API but is not endorsed or certified by TMDB.<br />
            © 2025 {SITE_NAME}
          </footer>
        </div>
      )}
      <style>{"@keyframes fadeSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}"}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 32px"}}>
      <SectionTitle>{title}</SectionTitle>
      <div style={{marginTop:"16px"}}>{children}</div>
    </div>
  );
}
function SectionTitle({ children }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
      <div style={{width:"3px",height:"16px",borderRadius:"2px",background:"linear-gradient(180deg,#818cf8,#60a5fa)"}} />
      <div style={{fontSize:"17px",fontWeight:700,color:"#fff",letterSpacing:"-0.01em"}}>{children}</div>
    </div>
  );
}
function Divider() {
  return <div style={{height:"1px",background:"rgba(255,255,255,0.05)",margin:"0 32px"}} />;
}

export default function Muuvie() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  function openMovie(m) {
    setSelectedMovie(m);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{background:"#0d0d0f",minHeight:"100vh",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",overflowX:"hidden"}}>

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:"64px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",background:"rgba(13,13,15,0.9)",borderBottom:"1px solid rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
        <button
          onClick={function(){ setSelectedMovie(null); window.scrollTo({top:0}); }}
          style={{display:"flex",alignItems:"center",gap:"10px",background:"none",border:"none",cursor:"pointer",color:"#fff",fontSize:"17px",fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,whiteSpace:"nowrap"}}
        >
          <img src="/logo.png" alt="" style={{width:"28px",height:"28px",borderRadius:"7px",objectFit:"cover",display:"block",flexShrink:0}} />
          <span style={{display:"inline-block"}}>{SITE_NAME}</span>
        </button>

        <div style={{display:"flex",alignItems:"center",gap:"28px"}}>
          {["Home","New","Popular","Lists","Guide"].map(function(label) {
            return (
              <button key={label} style={{background:"none",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:500,color:"rgba(255,255,255,0.45)",transition:"color 0.2s " + EASE}}
                onMouseEnter={function(e){e.target.style.color="#fff";}}
                onMouseLeave={function(e){e.target.style.color="rgba(255,255,255,0.45)";}}
              >{label}</button>
            );
          })}
        </div>

        <button style={{padding:"7px 18px",borderRadius:"6px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",fontSize:"13px",fontWeight:600,cursor:"pointer",transition:"all 0.2s " + EASE}}
          onMouseEnter={function(e){ e.currentTarget.style.background="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={function(e){ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}
        >Sign In</button>
      </nav>

      {selectedMovie ? (
        <DetailPage movie={selectedMovie} onBack={function(){ setSelectedMovie(null); }} onSelect={openMovie} />
      ) : (
        <HomePage onSelectMovie={openMovie} />
      )}
    </div>
  );
}
