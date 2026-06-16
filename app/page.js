"use client";
import { useState, useEffect, useRef } from "react";

const MOVIES = [
  {id:1,title:"Dune: Part Two",year:2024,type:"movie",rating:8.6,runtime:"166m",genres:["Sci-Fi","Adventure","Drama"],
   summary:"Paul Atreides unites with the Fremen on the desert world of Arrakis to wage war against the Harkonnens, fulfilling a prophecy that would change the galaxy forever.",
   poster:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"Way9Dexny3w",trending:true,isNew:true,rank:1,score:98,platforms:["netflix","prime","apple"],free:false},
  {id:2,title:"Oppenheimer",year:2023,type:"movie",rating:8.9,runtime:"180m",genres:["Drama","History","Thriller"],
   summary:"The story of J. Robert Oppenheimer's role in the development of the atomic bomb during WWII, told through the lens of his later security hearings.",
   poster:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"uYPbbksJxIg",trending:true,isNew:false,rank:2,score:96,platforms:["prime","peacock"],free:false},
  {id:3,title:"The Bear",year:2024,type:"tv",rating:8.7,runtime:"30m · 2 Seasons",genres:["Drama","Comedy"],
   summary:"A young chef from the fine dining world comes home to run his family's sandwich shop in Chicago, confronting old wounds and igniting a culinary transformation.",
   poster:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:true,isNew:false,rank:3,score:95,platforms:["hulu","disney"],free:false},
  {id:4,title:"Poor Things",year:2023,type:"movie",rating:8.2,runtime:"141m",genres:["Fantasy","Comedy","Drama"],
   summary:"The incredible tale of Bella Baxter, a young woman brought back to life by an eccentric scientist who flees to explore the world unburdened by the prejudices of her time.",
   poster:"https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"RlbR5N6veqw",trending:false,isNew:false,rank:4,score:91,platforms:["hulu","prime"],free:false},
  {id:5,title:"Shogun",year:2024,type:"tv",rating:9.0,runtime:"60m · 1 Season",genres:["Drama","History","Action"],
   summary:"In 1600s feudal Japan, a shipwrecked English sailor aligns with a powerful warlord as they navigate the treacherous political landscape of the civil war era.",
   poster:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:true,isNew:false,rank:5,score:99,platforms:["hulu","disney"],free:false},
  {id:6,title:"Civil War",year:2024,type:"movie",rating:7.5,runtime:"109m",genres:["Action","Thriller","Drama"],
   summary:"A team of journalists race across a near-future America tearing itself apart in a second civil war, risking everything to document the conflict.",
   poster:"https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:true,isNew:true,rank:6,score:87,platforms:["prime"],free:false},
  {id:7,title:"Inside Out 2",year:2024,type:"movie",rating:7.8,runtime:"100m",genres:["Animation","Family","Comedy"],
   summary:"Riley enters adolescence and her mind gets an unexpected remodel, with new emotions joining the original five.",
   poster:"https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1581337204873-ef36aa186caa?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:false,isNew:true,rank:7,score:85,platforms:["disney"],free:false},
  {id:8,title:"Amazon Freevee Picks",year:2024,type:"movie",rating:7.2,runtime:"Varies",genres:["Various"],
   summary:"Critically acclaimed films and documentaries available at no cost with ads — no subscription required.",
   poster:"https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:false,isNew:false,rank:8,score:72,platforms:["freevee"],free:true},
  {id:9,title:"Tubi Originals",year:2024,type:"tv",rating:6.8,runtime:"Varies",genres:["Various"],
   summary:"Hundreds of original and classic shows streaming completely free — no credit card, no subscription needed.",
   poster:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:false,isNew:false,rank:9,score:68,platforms:["tubi"],free:true},
  {id:10,title:"Furiosa",year:2024,type:"movie",rating:7.8,runtime:"148m",genres:["Action","Sci-Fi"],
   summary:"The origin story of the legendary warrior Furiosa before she crosses paths with the Mad Max gang and begins her long road back home.",
   poster:"https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:true,isNew:true,rank:10,score:82,platforms:["prime","hbo"],free:false},
  {id:11,title:"House of the Dragon S2",year:2024,type:"tv",rating:8.4,runtime:"60m · 2 Seasons",genres:["Fantasy","Drama","Action"],
   summary:"The Targaryen civil war enters its bloodiest phase as both sides marshal their forces and the fate of the Seven Kingdoms hangs in the balance.",
   poster:"https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:true,isNew:true,rank:11,score:90,platforms:["hbo"],free:false},
  {id:12,title:"Pluto",year:2024,type:"tv",rating:8.5,runtime:"60m · 1 Season",genres:["Animation","Sci-Fi","Mystery"],
   summary:"Based on Naoki Urasawa's manga, a robot investigator hunts the entity destroying the world's most powerful robots in this stunning Netflix anime.",
   poster:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=1200&fit=crop&auto=format",
   backdrop:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=600&fit=crop&auto=format",
   trailerKey:"",trending:false,isNew:true,rank:12,score:88,platforms:["netflix"],free:false},
];

const PLATFORMS = {
  netflix:{name:"Netflix",color:"#E50914",gradient:"linear-gradient(135deg,#E50914,#b00710)",border:"#E50914",label:"N",url:"https://netflix.com"},
  prime:{name:"Prime Video",color:"#00A8E1",gradient:"linear-gradient(135deg,#00A8E1,#0070a0)",border:"#00A8E1",label:"P",url:"https://primevideo.com"},
  disney:{name:"Disney+",color:"#0063E5",gradient:"linear-gradient(135deg,#0063E5,#003fa0)",border:"#0063E5",label:"D+",url:"https://disneyplus.com"},
  hulu:{name:"Hulu",color:"#3DBB3D",gradient:"linear-gradient(135deg,#3DBB3D,#1e8c1e)",border:"#3DBB3D",label:"H",url:"https://hulu.com"},
  apple:{name:"Apple TV+",color:"#a0a0a0",gradient:"linear-gradient(135deg,#555,#222)",border:"#888",label:"🍎",url:"https://tv.apple.com"},
  hbo:{name:"Max",color:"#5822FF",gradient:"linear-gradient(135deg,#5822FF,#3a00cc)",border:"#5822FF",label:"M",url:"https://max.com"},
  peacock:{name:"Peacock",color:"#FF6B35",gradient:"linear-gradient(135deg,#FF6B35,#cc4400)",border:"#FF6B35",label:"🦚",url:"https://peacocktv.com"},
  freevee:{name:"Amazon Freevee",color:"#3DBB3D",gradient:"linear-gradient(135deg,#3DBB3D,#1e8c1e)",border:"#3DBB3D",label:"F",url:"https://amazon.com/freevee",isFree:true},
  tubi:{name:"Tubi",color:"#FA004F",gradient:"linear-gradient(135deg,#FA004F,#b00035)",border:"#FA004F",label:"T",url:"https://tubitv.com",isFree:true},
};

// ── TRAILER MODAL ──────────────────────────────────────────────────────────
function TrailerModal({ trailerKey, title, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl" style={{background:"#0a0a0f",border:"1px solid rgba(255,255,255,0.1)"}}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm transition-all hover:bg-white/20" style={{background:"rgba(0,0,0,0.7)"}}>✕</button>
        <div className="relative" style={{paddingBottom:"56.25%",height:0}}>
          <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} title={`${title} Trailer`} allow="autoplay; encrypted-media" allowFullScreen />
        </div>
        <div className="px-4 py-2 text-center text-xs border-t" style={{color:"rgba(255,255,255,0.25)",borderColor:"rgba(255,255,255,0.08)"}}>
          🎬 Official trailer only · CineScope does not host or stream full content
        </div>
      </div>
    </div>
  );
}

// ── MOVIE CARD ─────────────────────────────────────────────────────────────
function MovieCard({ movie, onClick }) {
  return (
    <div onClick={() => onClick(movie)} className="group flex-shrink-0 w-40 cursor-pointer select-none">
      <div className="relative w-40 h-56 rounded-xl overflow-hidden mb-2" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        {/* gradient fade from bottom */}
        <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)"}} />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="text-xs font-semibold truncate text-white leading-tight">{movie.title}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-amber-400 text-xs">⭐ {movie.rating}</span>
            {movie.free && <span className="text-green-400 text-xs font-bold">· FREE</span>}
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{background:"rgba(0,0,0,0.6)",color:"rgba(255,255,255,0.5)"}}>
            {movie.year}
          </span>
        </div>
        {/* hover play hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"2px solid rgba(255,255,255,0.3)"}}>
            <span className="text-white text-sm ml-0.5">▶</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1 px-0.5">
        {movie.platforms.slice(0,3).map((pk)=>{
          const p=PLATFORMS[pk];
          return p?(
            <span key={pk} className="text-xs font-bold px-1.5 py-0.5 rounded" style={{background:"rgba(255,255,255,0.06)",color:p.color,fontSize:"9px"}}>
              {p.name.split(" ")[0]}
            </span>
          ):null;
        })}
      </div>
    </div>
  );
}

// ── PLATFORM SELECTOR ──────────────────────────────────────────────────────
function PlatformSelector({ platforms }) {
  const [selected, setSelected] = useState(platforms[0]);
  const p = PLATFORMS[selected];
  if (!p) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3" style={{color:"rgba(255,255,255,0.5)",letterSpacing:"0.08em",textTransform:"uppercase",fontSize:"11px"}}>Where to Watch</h3>
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {platforms.map((pk) => {
          const plat = PLATFORMS[pk];
          if (!plat) return null;
          const isActive = selected === pk;
          return (
            <button
              key={pk}
              onClick={() => setSelected(pk)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                border: isActive ? `1.5px solid ${plat.border}` : "1.5px solid rgba(255,255,255,0.08)",
                color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                boxShadow: isActive ? `0 0 16px ${plat.border}40, 0 0 4px ${plat.border}30` : "none",
              }}
            >
              <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{background:plat.gradient,color:"#fff",fontSize:"9px"}}>
                {plat.label}
              </span>
              {plat.name}
              {plat.isFree && <span className="text-xs font-bold" style={{color:"#22c55e"}}>FREE</span>}
            </button>
          );
        })}
      </div>
      {/* Selected platform detail card */}
      <div className="rounded-2xl p-4 transition-all duration-300" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${p.border}30`,boxShadow:`inset 0 0 40px ${p.border}08`}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{background:p.gradient,color:"#fff"}}>
            {p.label}
          </div>
          <div>
            <div className="font-bold text-white">{p.name}</div>
            {p.isFree
              ? <div className="text-xs font-semibold" style={{color:"#22c55e"}}>Free · No subscription needed</div>
              : <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Subscription required</div>}
          </div>
        </div>
        
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            if (confirm(`Open ${p.name} in a new tab?\n\nCineScope will redirect you to the official platform.`)) {
              window.open(p.url, "_blank", "noopener,noreferrer");
            }
          }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{background:p.gradient,boxShadow:`0 4px 20px ${p.border}40`}}
        >
          Watch now on {p.name} →
        </a>
      </div>
    </div>
  );
}

// ── DETAIL PAGE ────────────────────────────────────────────────────────────
function DetailPage({ movie, onBack, onSelect }) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);

  const similar = MOVIES.filter(
    (m) => m.id !== movie.id && (m.type === movie.type || m.genres.some((g) => movie.genres.includes(g)))
  ).slice(0, 8);

  return (
    <div className="min-h-screen" style={{background:"#0a0a0f"}}>
      {trailerOpen && movie.trailerKey && (
        <TrailerModal trailerKey={movie.trailerKey} title={movie.title} onClose={() => setTrailerOpen(false)} />
      )}

      {/* CINEMATIC BACKDROP */}
      <div className="relative w-full" style={{height:"520px"}}>
        <img
          src={movie.backdrop || movie.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{filter:"blur(2px) brightness(0.35)",transform:"scale(1.05)"}}
        />
        {/* multi-layer gradient fade */}
        <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.1) 30%, rgba(10,10,15,0.7) 70%, rgba(10,10,15,1) 100%)"}} />
        <div className="absolute inset-0" style={{background:"linear-gradient(to right, rgba(10,10,15,0.8) 0%, transparent 50%)"}} />

        {/* BACK BUTTON */}
        <div className="absolute top-20 left-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)"}}
          >
            ← Back
          </button>
        </div>

        {/* POSTER + TITLE overlay on backdrop */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 flex items-end gap-6 max-w-6xl mx-auto" style={{bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"1100px"}}>
          <img
            src={movie.poster}
            alt={movie.title}
            className="hidden md:block flex-shrink-0 rounded-2xl object-cover shadow-2xl"
            style={{width:"160px",height:"230px",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}}
          />
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {movie.genres.map((g) => (
                <span key={g} className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{background:"rgba(139,92,246,0.15)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.25)"}}>{g}</span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2" style={{textShadow:"0 2px 20px rgba(0,0,0,0.8)"}}>{movie.title}</h1>
            <div className="flex items-center gap-3 text-sm" style={{color:"rgba(255,255,255,0.5)"}}>
              <span className="text-amber-400 font-bold">⭐ {movie.rating}</span>
              <span>·</span><span>{movie.year}</span>
              <span>·</span><span>{movie.runtime}</span>
              <span>·</span><span className="capitalize">{movie.type === "tv" ? "TV Show" : "Movie"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT BELOW BACKDROP */}
      <div className="max-w-6xl mx-auto px-6 py-8" style={{marginTop:"-2px"}}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: summary + trailer + platforms */}
          <div className="lg:col-span-2">
            <p className="text-base leading-relaxed mb-6" style={{color:"rgba(255,255,255,0.6)"}}>{movie.summary}</p>

            {/* PLAY TRAILER BUTTON */}
            <div className="mb-8">
              <button
                onClick={() => movie.trailerKey && setTrailerOpen(true)}
                disabled={!movie.trailerKey}
                className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base text-white transition-all duration-200"
                style={{
                  background: movie.trailerKey
                    ? "linear-gradient(135deg, #16a34a, #22c55e)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: movie.trailerKey ? "0 6px 30px rgba(34,197,94,0.4)" : "none",
                  border: movie.trailerKey ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: movie.trailerKey ? "#fff" : "rgba(255,255,255,0.25)",
                  cursor: movie.trailerKey ? "pointer" : "not-allowed",
                  transform: "translateY(0)",
                }}
                onMouseEnter={(e) => { if (movie.trailerKey) e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = movie.trailerKey ? "0 10px 40px rgba(34,197,94,0.55)" : "none"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = movie.trailerKey ? "0 6px 30px rgba(34,197,94,0.4)" : "none"; }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"rgba(255,255,255,0.2)"}}>
                  <span className="ml-0.5 text-lg">▶</span>
                </div>
                {movie.trailerKey ? "Play Trailer" : "No Trailer Available"}
              </button>
            </div>

            {/* PLATFORMS */}
            <PlatformSelector platforms={movie.platforms} />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setWatchlisted(!watchlisted)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: watchlisted ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.06)",
                  border: watchlisted ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: watchlisted ? "#a78bfa" : "rgba(255,255,255,0.6)"
                }}
              >
                {watchlisted ? "✓ In Watchlist" : "+ Add to Watchlist"}
              </button>
            </div>
          </div>

          {/* RIGHT: movie info sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-5 sticky top-20" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <img src={movie.poster} alt={movie.title} className="w-full rounded-xl object-cover mb-4 block md:hidden lg:block" style={{height:"280px",border:"1px solid rgba(255,255,255,0.1)"}} />
              <div className="space-y-3 text-sm">
                {[
                  ["Type", movie.type === "tv" ? "TV Show" : "Movie"],
                  ["Year", movie.year],
                  ["Runtime", movie.runtime],
                  ["Rating", `⭐ ${movie.rating} / 10`],
                  ["Genres", movie.genres.join(", ")],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span style={{color:"rgba(255,255,255,0.35)"}}>{k}</span>
                    <span className="text-right font-medium" style={{color:"rgba(255,255,255,0.8)"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-white mb-5">You Might Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={(mv) => { onSelect(mv); window.scrollTo({top:0,behavior:"smooth"}); }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────
function HomePage({ onSelectMovie }) {
  const [query, setQuery] = useState("");
  const [acResults, setAcResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchResults, setSearchResults] = useState(null);
  const searchRef = useRef(null);

  const trending = MOVIES.filter((m) => m.trending);
  const isNew = MOVIES.filter((m) => m.isNew);
  const free = MOVIES.filter((m) => m.free);
  const leaderboard = [...MOVIES].sort((a, b) => b.score - a.score).slice(0, 5);

  const FILTERS = [
    {key:"all",label:"All"},
    {key:"movie",label:"🎬 Movies"},
    {key:"tv",label:"📺 TV Shows"},
    {key:"trending",label:"🔥 Trending"},
    {key:"new",label:"✨ New"},
  ];

  function handleInput(val) {
    setQuery(val);
    if (!val.trim()) { setAcResults([]); return; }
    const q = val.toLowerCase();
    setAcResults(MOVIES.filter((m) => m.title.toLowerCase().includes(q) || m.genres.some((g) => g.toLowerCase().includes(q))).slice(0, 5));
  }

  function handleKey(e) {
    if (e.key === "Enter" && query.trim()) {
      const q = query.toLowerCase();
      setSearchResults(MOVIES.filter((m) => m.title.toLowerCase().includes(q) || m.genres.some((g) => g.toLowerCase().includes(q))));
      setAcResults([]);
    }
    if (e.key === "Escape") setAcResults([]);
  }

  function applyFilter(key) {
    setActiveFilter(key);
    setSearchResults(null);
    setQuery("");
    setAcResults([]);
    if (key === "all") return;
    const filtered = MOVIES.filter((m) => {
      if (key === "movie") return m.type === "movie";
      if (key === "tv") return m.type === "tv";
      if (key === "trending") return m.trending;
      if (key === "new") return m.isNew;
      return true;
    });
    setSearchResults(filtered);
  }

  useEffect(() => {
    const h = (e) => { if (!searchRef.current?.contains(e.target)) setAcResults([]); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showHome = !searchResults && activeFilter === "all";

  return (
    <div className="min-h-screen" style={{background:"#0a0a0f"}}>

      {/* HERO with cinematic backdrop collage */}
      <div className="relative" style={{minHeight:"600px",paddingTop:"64px"}}>
        {/* Blurred backdrop grid */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 grid" style={{gridTemplateColumns:"repeat(4,1fr)",gap:"2px",opacity:0.18}}>
            {MOVIES.slice(0,8).map((m) => (
              <div key={m.id} className="overflow-hidden" style={{height:"600px"}}>
                <img src={m.poster} alt="" className="w-full h-full object-cover" style={{filter:"blur(1px)"}} />
              </div>
            ))}
          </div>
          {/* gradient overlays */}
          <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(10,10,15,0.6) 0%, rgba(10,10,15,0.3) 30%, rgba(10,10,15,0.85) 70%, rgba(10,10,15,1) 100%)"}} />
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(108,99,255,0.15) 0%, transparent 70%)"}} />
        </div>

        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{color:"#a78bfa",letterSpacing:"0.15em"}}>🎬 Stream smarter</p>
          <h1 className="font-black tracking-tight leading-none mb-4 text-white" style={{fontSize:"clamp(2.5rem,7vw,5rem)",textShadow:"0 4px 40px rgba(0,0,0,0.6)"}}>
            Your streaming guide<br />
            <span style={{background:"linear-gradient(135deg,#818cf8,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              for every platform
            </span>
          </h1>
          <p className="text-base mb-10 max-w-md" style={{color:"rgba(255,255,255,0.45)"}}>
            Find where to stream new, popular & upcoming movies and shows.
          </p>

          {/* SEARCH */}
          <div ref={searchRef} className="relative w-full" style={{maxWidth:"600px"}}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"rgba(255,255,255,0.3)"}}>🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search movies, TV shows, actors…"
              className="w-full outline-none text-sm text-white transition-all"
              style={{
                paddingLeft:"2.75rem",paddingRight:"4rem",paddingTop:"1rem",paddingBottom:"1rem",
                background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"16px",
                backdropFilter:"blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
              }}
              onFocus={(e) => { e.target.style.borderColor="rgba(139,92,246,0.6)"; e.target.style.boxShadow="0 0 0 3px rgba(139,92,246,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.boxShadow="none"; }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.25)"}}>⌘K</span>

            {/* AUTOCOMPLETE */}
            {acResults.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden z-50 shadow-2xl" style={{background:"rgba(18,18,28,0.97)",border:"1px solid rgba(255,255,255,0.1)",backdropFilter:"blur(20px)"}}>
                {acResults.map((m) => (
                  <div key={m.id} onClick={() => { setAcResults([]); onSelectMovie(m); }} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors" style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}
                    onMouseEnter={(e)=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                    onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
                  >
                    <img src={m.poster} alt={m.title} className="w-9 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                    <div>
                      <div className="text-sm font-semibold text-white">{m.title}</div>
                      <div className="text-xs" style={{color:"rgba(255,255,255,0.35)"}}>{m.year} · {m.type==="tv"?"TV":"Movie"} · ⭐ {m.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => applyFilter(f.key)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: activeFilter===f.key ? "rgba(139,92,246,1)" : "rgba(255,255,255,0.06)",
                  border: activeFilter===f.key ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
                  color: activeFilter===f.key ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* STREAMING SERVICES ROW (JustWatch-style) */}
          <div className="mt-10">
            <p className="text-xs mb-3" style={{color:"rgba(255,255,255,0.25)",letterSpacing:"0.05em"}}>Streaming services on CineScope</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(PLATFORMS).map(([key,p]) => (
                <div key={key} className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-transform hover:scale-110 cursor-pointer" style={{background:p.gradient,color:"#fff",boxShadow:`0 2px 8px ${p.border}40`}} title={p.name}>
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH / FILTER RESULTS */}
      {searchResults && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              {activeFilter !== "all"
                ? {movie:"🎬 Movies",tv:"📺 TV Shows",trending:"🔥 Trending",new:"✨ New Releases"}[activeFilter]
                : `Results for "${query}"`}
            </h2>
            <button onClick={() => { setSearchResults(null); setActiveFilter("all"); setQuery(""); }} className="text-sm transition-colors" style={{color:"rgba(139,92,246,0.8)"}}>
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {searchResults.map((m) => <MovieCard key={m.id} movie={m} onClick={onSelectMovie} />)}
            {searchResults.length === 0 && <p className="col-span-full text-center py-12 text-sm" style={{color:"rgba(255,255,255,0.25)"}}>No results found.</p>}
          </div>
        </div>
      )}

      {/* HOME CONTENT */}
      {showHome && (
        <>
          {/* TRENDING */}
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">🔥 Trending Now</h2>
              <button onClick={() => applyFilter("trending")} className="text-sm transition-colors" style={{color:"rgba(139,92,246,0.8)"}}>See all →</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
              {trending.map((m) => <MovieCard key={m.id} movie={m} onClick={onSelectMovie} />)}
            </div>
          </section>

          <div className="mx-6" style={{height:"1px",background:"rgba(255,255,255,0.05)"}} />

          {/* POPULAR + FREE */}
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-4">📈 Popular This Week</h2>
              <div className="flex flex-col gap-2">
                {leaderboard.map((m, i) => (
                  <div key={m.id} onClick={() => onSelectMovie(m)} className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:translate-x-1"
                    style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}
                    onMouseEnter={(e)=>{ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}
                    onMouseLeave={(e)=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}
                  >
                    <span className="text-lg font-black min-w-[28px] text-center" style={{color:i<3?"#f59e0b":"rgba(255,255,255,0.2)"}}>{i+1}</span>
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)"}} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{m.title}</div>
                      <div className="text-xs" style={{color:"rgba(255,255,255,0.35)"}}>⭐ {m.rating} · {m.year}</div>
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
                        <div className="h-full rounded-full" style={{width:`${m.score}%`,background:"linear-gradient(90deg,#6366f1,#3b82f6)"}} />
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0" style={{background:"rgba(139,92,246,0.12)",color:"#a78bfa"}}>#{m.rank}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">🆓 Free to Watch</h2>
                <span className="text-xs" style={{color:"rgba(255,255,255,0.25)"}}>Ad-supported · Legal</span>
              </div>
              <div className="flex flex-col gap-2">
                {free.map((m) => {
                  const p = PLATFORMS[m.platforms[0]];
                  return (
                    <div key={m.id} onClick={() => onSelectMovie(m)} className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:translate-x-1"
                      style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}
                      onMouseEnter={(e)=>{ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(34,197,94,0.2)"; }}
                      onMouseLeave={(e)=>{ e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}
                    >
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={m.poster} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)"}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{m.title}</div>
                        <div className="text-xs font-semibold" style={{color:"#22c55e"}}>{p?.name}</div>
                        <div className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>No subscription needed</div>
                      </div>
                      <span style={{color:"rgba(255,255,255,0.2)"}}>→</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mx-6" style={{height:"1px",background:"rgba(255,255,255,0.05)"}} />

          {/* NEW RELEASES */}
          <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">✨ New Releases</h2>
              <button onClick={() => applyFilter("new")} className="text-sm transition-colors" style={{color:"rgba(139,92,246,0.8)"}}>See all →</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
              {isNew.map((m) => <MovieCard key={m.id} movie={m} onClick={onSelectMovie} />)}
            </div>
          </section>

          <footer className="text-center py-10 px-4 text-xs" style={{color:"rgba(255,255,255,0.18)",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            CineScope does not host any content. All streaming links redirect to official platforms. Trailers are embedded from YouTube.<br />
            © 2025 CineScope · All data is illustrative.
          </footer>
        </>
      )}
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function CineScope() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  function openMovie(m) {
    setSelectedMovie(m);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{background:"#0a0a0f",minHeight:"100vh"}}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6" style={{height:"64px",background:"rgba(10,10,15,0.85)",borderBottom:"1px solid rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
        <button onClick={() => { setSelectedMovie(null); window.scrollTo({top:0}); }} className="flex items-center gap-2.5 font-black text-lg tracking-tight text-white">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{background:"linear-gradient(135deg,#6366f1,#3b82f6)"}}>🎬</span>
          CineScope
        </button>
        <div className="hidden md:flex items-center gap-6">
          {[["All","all"],["Movies","movie"],["TV Shows","tv"],["Trending","trending"],["New","new"]].map(([label,key]) => (
            <button key={key} className="text-sm font-medium transition-colors" style={{color:"rgba(255,255,255,0.45)"}}
              onMouseEnter={(e)=>e.target.style.color="#fff"} onMouseLeave={(e)=>e.target.style.color="rgba(255,255,255,0.45)"}
            >{label}</button>
          ))}
        </div>
        <div className="w-8" />
      </nav>

      {selectedMovie ? (
        <DetailPage movie={selectedMovie} onBack={() => setSelectedMovie(null)} onSelect={openMovie} />
      ) : (
        <HomePage onSelectMovie={openMovie} />
      )}
    </div>
  );
}
