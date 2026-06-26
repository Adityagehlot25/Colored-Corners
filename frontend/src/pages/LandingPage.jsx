import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingRail, setLoadingRail] = useState(true);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    axios.get(`${backendUrl}/products`)
      .then(res => {
        const activeOnly = res.data.filter(item => item.status === 'ACTIVE');
        setFeaturedItems(activeOnly.slice(0, 4));
      })
      .catch(err => console.error("Rail fetch error:", err))
      .finally(() => setLoadingRail(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9EE] text-[#333] font-sans-inter selection:bg-[#5C5140] selection:text-white pb-24">
      <Navbar />

      {/* ========================================== */}
      {/* 📐 FIGMA EXACT: TEXT CONTAINER */}
      {/* ========================================== */}

      {/* Master Container: w: 1312, h: 245, mt: 64px, strict vertical gap: 40px */}
      <div className="mx-auto max-w-[1312px] px-6 lg:px-0 mt-[64px] flex flex-col items-center justify-start gap-[40px]">

        {/* --- SECTION 1: HEADING + SUBTEXT (strict vertical gap: 16px) --- */}
        <div className="flex flex-col items-center justify-start gap-[16px] w-full max-w-[1312px]">

          {/* Heading Component (w: 1312, h: 100, strict vertical gap: 4px) */}
          <div className="flex flex-col items-center justify-center gap-[4px] w-full h-[100px] text-[#222222]">

            <h1 className="font-instrument text-[48px] font-normal leading-none tracking-[-0.02em] text-center m-0 p-0">
              Tiny treasures.
            </h1>

            <h1 className="font-instrument text-[48px] italic font-normal leading-none tracking-[-0.02em] text-center m-0 p-0">
              Handmade with heart.
            </h1>

          </div>

          {/* Subtext Component (Widened to 680px to guarantee 2 lines, line-height locked to 19px) */}
          <p className="font-inter w-full max-w-[680px] text-[16px] font-normal text-[#000000]/55 tracking-[-0.03em] leading-[19px] text-center m-0 p-0 antialiased">
            From handcrafted mugs and cozy bedsheets to crochet keepsakes and thoughtful home décor, every piece is made to bring a little more warmth, charm, and color into your everyday life.
          </p>

        </div>

        {/* --- SECTION 2: CTAs (w: 370, h: 51, gap: 12px) --- */}
        {/* Notice: ZERO top margins here. The parent's gap-[40px] dictates the exact distance! */}
        <div className="flex items-center justify-center gap-[12px] w-[370px] h-[51px] m-0 p-0">

          <Link
            to="/dashboard"
            className="font-inter flex h-[51px] w-[176px] shrink-0 items-center justify-center rounded-[12px] bg-[#5C5140] text-[16px] font-normal leading-none tracking-[-0.03em] text-white whitespace-nowrap shadow-xs transition-all hover:bg-[#433a2e] active:scale-95 antialiased"
          >
            Shop the Collection
          </Link>

          <Link
            to="/dashboard"
            className="font-inter flex h-[51px] w-[176px] shrink-0 items-center justify-center rounded-[12px] bg-[#DBD0BC]/40 border border-[#5C5140]/15 text-[16px] font-normal leading-none tracking-[-0.03em] text-[#5C5140] whitespace-nowrap transition-all hover:bg-[#DBD0BC] active:scale-95 antialiased"
          >
            Explore New Arrivals
          </Link>

        </div>

      </div>

      {/* ========================================== */}
      {/* 🖼️ FIGMA EXACT: ILLUSTRATION + DOT GRID */}
      {/* ========================================== */}

      <div className="mx-auto max-w-[1312px] h-[569px] mt-[64px] px-6 lg:px-0 relative overflow-hidden flex justify-center items-start pt-[18px] select-none">

        {/* --- LAYER 1: TIGHT BOUTIQUE PIN-PRICK DOT MATRIX --- */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            backgroundColor: '#FFF9EE',
            /* 1.5px soft brown dot repeating every 12px creates that dense Figma texture! */
            backgroundImage: 'radial-gradient(rgba(92, 80, 64, 0.18) 1.2px, transparent 1.2px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* --- LAYER 2: THE FIGMA FOG MASK (Melt top & bottom boundaries) --- */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: 'linear-gradient(180deg, #FFF9EE 0%, rgba(255, 249, 238, 0) 22%, rgba(255, 249, 238, 0) 78%, #FFF9EE 100%)'
          }}
        />

        {/* --- LAYER 3: THE OPAQUE LCP ILLUSTRATION --- */}
        {/* Removed mix-blend-multiply so the ceramic mugs physically block the wallpaper dots! */}
        <img
          src="/hero-illustration.svg"
          alt="Handcrafted Treasures Showcase"
          width={1051}
          height={471}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          style={{ zIndex: 2 }}
          className="w-full max-w-[1051px] h-[471px] object-contain drop-shadow-xs antialiased relative"
        />

      </div>

      {/* --- THE LIVE PRODUCT RAIL --- */}
      <div className="mt-32 max-w-[1440px] mx-auto px-6 sm:px-16 border-t border-[#5C5140]/10 pt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-serif-instrument text-[#222]">Curated Cornerpieces</h2>
            <p className="text-xs text-[#5C5140]/70 mt-1 uppercase tracking-wider font-mono">Live Postgres Database Feed</p>
          </div>
          <Link to="/dashboard" className="text-sm font-semibold text-[#5C5140] hover:underline">
            View All Catalogue →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingRail ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-[340px] bg-[#DBD0BC]/20 rounded-2xl animate-pulse" />
            ))
          ) : featuredItems.length === 0 ? (
            <p className="text-[#5C5140]/60 col-span-4 text-center py-12 italic font-serif-instrument text-lg">Our artisans are currently restocking the shelves...</p>
          ) : (
            featuredItems.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="group bg-white/60 border border-[#5C5140]/10 hover:border-[#5C5140]/40 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#FFF9EE] mb-4">
                    <img
                      src={item.imgs?.[0] || 'https://via.placeholder.com/300'}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#5C5140] font-bold uppercase tracking-widest bg-[#DBD0BC]/40 px-2 py-0.5 rounded">{item.category}</span>
                  <h4 className="font-semibold text-base mt-2 text-[#222] truncate">{item.name}</h4>
                </div>
                <p className="mt-4 text-lg font-bold text-[#5C5140] font-serif-instrument">₹{item.price}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}