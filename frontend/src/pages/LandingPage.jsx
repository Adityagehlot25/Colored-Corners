import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BasketIcon, QuestionMark, TestimonialIcon } from '../components/icons';
import { ProductCard, TestimonialCard } from '../components/common';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// ==========================================
// 🧩 REUSABLE COMPONENT: CATEGORY CARD
// ==========================================
const CategoryCard = ({ title, imageSrc }) => {
  return (
    <div className="relative shrink-0 w-[357px] h-[357px] rounded-[12px] p-[4px] overflow-hidden group cursor-pointer">

      {/* 1. Category Background Image */}
      <img
        src={imageSrc}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover rounded-[12px] transition-transform duration-700 group-hover:scale-105"
      />

      {/* 2. Glassmorphism Title Bar (Nested perfectly inside the 4px padding) */}
      <div className="absolute bottom-[4px] left-[4px] w-[349px] h-[72px] rounded-[8px] bg-[#5C5140]/50 border border-[#FFFFFF]/20 backdrop-blur-[40px] flex items-center justify-center overflow-hidden">

        {/* 3. The Nested Title Dot Grid (Using the zero-DOM CSS radial injection) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* 4. The Category Title */}
        <h3 className="font-instrument text-[32px] font-normal text-white leading-none tracking-[-0.02em] z-10 m-0 p-0 antialiased">
          {title}
        </h3>

      </div>

    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingRail, setLoadingRail] = useState(true);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}/products`)
      .then(res => {
        // Filter active items and reverse so newest arrivals sit first
        const activeOnly = res.data.filter(item => item.status === 'ACTIVE');
        setProducts(activeOnly);
      })
      .catch(err => console.error("Product fetch error:", err))
      .finally(() => setLoadingProducts(false));
  }, []);

  // 🏷️ Ref for Native Carousel Scrolling
  const carouselRef = useRef(null);

  // 🎨 Secondary Palette Mapping
  const secondaryColors = ['#E4ACB2', '#EABCA8', '#FAEDCD', '#CCD5AE', '#99BAB9'];

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      // 300px card width + 28px gap = 328px scroll jump
      const scrollAmount = direction === 'left' ? -328 : 328;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 🛍️ Mock Bestseller Products
  const bestsellersMock = [
    { id: 'bs_1', name: 'Cactus Painted Coffee Mug', price: '250', originalPrice: '790', image: '/CupsStacked.jpg' },
    { id: 'bs_2', name: 'Floral Hand-Block Bedsheet', price: '1450', originalPrice: '2200', image: '/BeddingsThumbnail.jpg' },
    { id: 'bs_3', name: 'Hand-Stitched Jute Tote Bag', price: '650', originalPrice: '990', image: '/BagsNPouchesThumbnail.jpg' },
    { id: 'bs_4', name: 'Artisan Block-Print Fabric Set', price: '850', originalPrice: '1200', image: '/PrintingBedsheet.png' },
    { id: 'bs_5', name: 'Terracotta Ceramic Table Bowl', price: '450', originalPrice: '700', image: '/TablewareThumbnail.jpg' },
    { id: 'bs_6', name: 'Pastel Daisy Ceramic Mug', price: '280', originalPrice: '550', image: '/CupsStacked.jpg' },
  ];

  // 💬 Mock Testimonials
  const testimonialsMock = [
    { id: 't_1', quote: '“Really loved this brand and their cutesy products. Would buy more in future.”', name: 'Siddhanth Chauhan', location: 'Mumbai' },
    { id: 't_2', quote: '“The hand-painted ceramic mugs feel so personal. Every morning coffee feels like a ritual now.”', name: 'Ananya Sharma', location: 'Bengaluru' },
    { id: 't_3', quote: '“Super fast delivery and the cotton hand-block bedsheet is unbelievably soft. 10/10 recommendation!”', name: 'Rohan Mehta', location: 'New Delhi' },
    { id: 't_4', quote: '“You can actually feel the artisan craftsmanship in the jute tote bag. It goes with every outfit I own.”', name: 'Priya Patel', location: 'Ahmedabad' },
    { id: 't_5', quote: '“Customer service was super responsive when I needed custom gift wrapping for my sister’s wedding.”', name: 'Kavita Nair', location: 'Kochi' },
  ];

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

      {/* ========================================== */}
      {/* 🗂️ NEW SECTION: CATEGORY PAGE */}
      {/* ========================================== */}

      {/* Master Category Wrapper: w-full, strict top/bottom padding 140px, px 64px */}
      <div className="w-full max-w-[1440px] mx-auto pt-[140px] pb-[140px] px-[64px] flex flex-col items-center gap-[64px]">

        {/* --- CORE FRAME 1: TEXT CONTAINER --- */}
        {/* w: 1312, h: 92, gap: 14px */}
        <div className="flex flex-col items-center justify-start gap-[14px] w-full max-w-[1312px] h-[92px]">

          {/* Frame 1.1: Section Tag Pill */}
          <div className="flex items-center justify-center gap-[8px] w-[148px] h-[30px] rounded-full bg-[#000000]/10 pl-[4px] pr-[12px] py-[4px] border-l border-transparent">

            {/* 1.1.1 Basket Icon Component */}
            <div className="w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <BasketIcon />
            </div>

            {/* 1.1.2 Pill Text (Added whitespace-nowrap!) */}
            <span className="font-inter text-[14px] font-normal text-[#5C5140] leading-[16px] tracking-[-0.04em] text-center antialiased whitespace-nowrap">
              Shop by Category
            </span>

          </div>

          {/* Frame 1.2: Main Heading */}
          <h2 className="font-instrument text-[48px] font-normal text-[#222222] leading-none tracking-[-0.02em] text-center w-full h-[48px] m-0 p-0 antialiased">
            Find your Corner
          </h2>

        </div>

        {/* --- CORE FRAME 2: CATEGORY CONTAINER --- */}
        {/* w: 1312, flex row, gap: 20px */}
        <div className="flex flex-row items-center justify-center gap-[20px] w-full max-w-[1312px]">

          <CategoryCard
            title="Tableware"
            imageSrc="/TablewareThumbnail.jpg"
          />

          <CategoryCard
            title="Bags & Pouches"
            imageSrc="/BagsNPouchesThumbnail.jpg"
          />

          <CategoryCard
            title="Beddings"
            imageSrc="/BeddingsThumbnail.jpg"
          />

        </div>

      </div>

      {/* ========================================== */}
      {/* 📖 NEW SECTION: ABOUT (BENTO GRID) */}
      {/* ========================================== */}

      <div className="w-full max-w-[1440px] mx-auto pt-[100px] pb-[100px] px-[32px] lg:px-[64px]">

        {/* Inner Stacking Context: Enforced gap-[56px] prevents collisions on 13-inch screens! */}
        <div className="relative w-full lg:h-[670px] flex flex-col lg:flex-row items-start justify-between gap-[40px] xl:gap-[56px] z-10">

          {/* ========================================== */}
          {/* 🎯 CORE FRAME 2: LEFT SECTION (TEXT) */}
          {/* ========================================== */}
          {/* Removed shrink-0 and added max-w. This allows the container to squeeze, wrapping the text into the extra vertical headroom! */}
          <div className="relative z-10 flex flex-col justify-between w-full max-w-[424px] h-full min-h-[670px] lg:min-h-0">

            {/* ========================================== */}
            {/* 🎯 CORE FRAME 1: THE BIGGER DOT GRID */}
            {/* ========================================== */}
            {/* Anchored firmly to the left text container so it never bleeds into the images on smaller screens */}
            <div className="absolute top-[69px] left-[1px] w-[741px] h-[507px] z-0 pointer-events-none">

              {/* Layer 1: The Sparser 3px Dot Matrix */}
              <div
                className="absolute inset-0"
                style={{
                  /* 1.5px radius = strictly 3px dots. Spaced exactly 32px apart to match Figma! */
                  backgroundImage: 'radial-gradient(#5C5040 1.5px, transparent 1.5px)',
                  backgroundSize: '32px 32px',
                  opacity: 0.20
                }}
              />

              {/* Layer 2: The Fog Mask */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 70% 70% at 40% 50%, transparent 20%, #FFF9EE 95%)'
                }}
              />

            </div>

            {/* Text Container (Sitting above the grid via relative z-10) */}
            <div className="relative z-10 flex flex-col gap-[16px] w-full">

              {/* Headline + Tag */}
              <div className="flex flex-col gap-[14px] w-full">

                <div className="flex items-center justify-center gap-[8px] w-[81px] h-[30px] rounded-full bg-[#000000]/10 pl-[4px] pr-[12px] py-[4px]">
                  <div className="w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 text-[10px] font-bold text-[#5C5140]">
                    <QuestionMark />
                  </div>
                  <span className="font-inter text-[14px] font-normal text-[#5C5140] leading-[16px] tracking-[-0.04em] whitespace-nowrap antialiased">
                    About
                  </span>
                </div>

                <div className="flex flex-col gap-[4px] w-full text-[#222222]">
                  <h2 className="font-instrument text-[48px] font-normal leading-none tracking-[-0.02em] m-0 p-0 antialiased">
                    Why
                  </h2>
                  <h2 className="font-instrument text-[48px] italic font-normal leading-none tracking-[-0.02em] m-0 p-0 antialiased">
                    Coloured Corners?
                  </h2>
                </div>

              </div>

              {/* Subtext */}
              <p className="font-inter text-[16px] font-normal text-[#4A4A4A] leading-[1.4] tracking-[-0.03em] m-0 p-0 antialiased pr-4">
                Every home has that one corner that feels like you — a little messy, a little magical, completely yours.
                <br /><br />
                <span className="font-semibold text-[#222222]">Coloured Corners started with a simple idea:</span>
                <br />
                Handmade things should feel personal, not perfect. Every cup is hand-painted, every bedsheet hand-block-printed, every jute bag hand-stitched by artisans who put a piece of themselves into the work.
              </p>

            </div>

            {/* CTA Button */}
            <Link
              to="/about"
              className="relative z-10 font-inter flex h-[51px] w-[159px] shrink-0 items-center justify-center rounded-[12px] bg-[#5C5140] text-[16px] font-normal leading-none tracking-[-0.03em] text-white whitespace-nowrap shadow-xs transition-all hover:bg-[#433a2e] active:scale-95 antialiased mt-8 lg:mt-0"
            >
              Meet the Makers
            </Link>

          </div>

          {/* ========================================== */}
          {/* 🎯 CORE FRAME 3: RIGHT SECTION (BENTO GRID) */}
          {/* ========================================== */}
          <div className="relative z-10 flex flex-col gap-[10px] w-full max-w-[832px] h-[670px] shrink-0 lg:shrink">

            {/* Row 1 */}
            <div className="flex flex-row gap-[10px] w-full h-[330px]">
              <div className="w-[67%] h-full p-[4px] rounded-[12px] overflow-hidden group bg-[#000000]/5">
                <img src="/PrintingBedsheet.png" alt="Artisan printing" className="w-full h-full object-cover rounded-[8px] transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="w-[33%] h-full p-[4px] rounded-[12px] overflow-hidden group bg-[#000000]/5">
                <img src="/BeddingsThumbnail.jpg" alt="Bedding" className="w-full h-full object-cover rounded-[8px] transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-row gap-[10px] w-full h-[330px]">
              <div className="w-[33%] h-full p-[4px] rounded-[12px] overflow-hidden group bg-[#000000]/5">
                <img src="/BagsNPouchesThumbnail.jpg" alt="Jute bag" className="w-full h-full object-cover rounded-[8px] transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="w-[67%] h-full p-[4px] rounded-[12px] overflow-hidden group bg-[#000000]/5">
                <img src="/CupsStacked.jpg" alt="Painted cups" className="w-full h-full object-cover rounded-[8px] transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* 🌟 FIGMA EXACT: BESTSELLERS SECTION */}
      {/* ========================================== */}

      {/* Master Root Frame: pt/pb 100px */}
      <div className="w-full pt-[100px] pb-[100px] overflow-hidden flex flex-col gap-[64px] relative">

        {/* --- CORE COMPONENT 1: TEXT CONTAINER (Strictly Centered 1:1 with Figma) --- */}
        <div className="mx-auto w-full max-w-[1312px] px-[32px] lg:px-[64px] flex flex-col items-center justify-center gap-[14px]">

          {/* Frame 1.1: Tag Pill (Strict 1:1 match with Shop by Category) */}
          <div className="flex items-center justify-center gap-[8px] h-[30px] rounded-full bg-[#000000]/10 pl-[4px] pr-[12px] py-[4px]">
            <BasketIcon />
            <span className="font-inter text-[14px] font-normal text-[#5C5140] leading-[16px] tracking-[-0.04em] whitespace-nowrap antialiased">
              Bestsellers
            </span>
          </div>

          {/* Frame 1.2: Headline + Subtext */}
          <div className="flex flex-col gap-[16px] items-center text-center">
            <h2 className="font-instrument text-[48px] font-normal text-[#222222] leading-none tracking-[-0.02em] m-0 p-0 antialiased">
              Customer Favourites
            </h2>
            <p className="font-inter text-[16px] font-normal text-[#000000]/54 leading-none tracking-[-0.03em] m-0 p-0 antialiased">
              The corners people keep coming back to.
            </p>
          </div>

        </div>

        {/* --- CORE COMPONENT 2: CAROUSEL TRACK WITH PHYSICAL SPACERS --- */}
        <div className="relative w-full group">

          {/* Left Navigation Arrow (Sits inside the 64px gutter!) */}
          <button
            onClick={() => scrollCarousel('left')}
            aria-label="Previous Products"
            className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] rounded-full border border-[#5C5140]/20 bg-[#FFF9EE]/90 backdrop-blur-md flex items-center justify-center text-[#5C5140] hover:bg-[#5C5140] hover:text-white transition-all active:scale-95 cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
          >
            ←
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={() => scrollCarousel('right')}
            aria-label="Next Products"
            className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-[48px] h-[48px] rounded-full border border-[#5C5140]/20 bg-[#FFF9EE]/90 backdrop-blur-md flex items-center justify-center text-[#5C5140] hover:bg-[#5C5140] hover:text-white transition-all active:scale-95 cursor-pointer shadow-md opacity-0 group-hover:opacity-100"
          >
            →
          </button>

          {/* Scrollable Track */}
          <div
            ref={carouselRef}
            className="w-full flex flex-row items-center gap-[28px] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Physical Left Spacer */}
            <div className="shrink-0 w-[12px] lg:w-[36px]" aria-hidden="true" />

            {/* 🛑 CONDITIONAL RENDERING: Live Backend vs Loading Skeletons */}
            {loadingProducts ? (
              /* Show 4 pulsing skeleton cards while MySQL/Postgres responds */
              [...Array(4)].map((_, i) => (
                <div key={i} className="shrink-0 w-[300px] h-[463px] rounded-[12px] bg-[#DBD0BC]/20 animate-pulse" />
              ))
            ) : products.length === 0 ? (
              /* Fallback message if database is currently empty */
              <div className="w-full py-12 text-center text-[#5C5140]/60 font-serif-instrument text-xl italic">
                Our artisans are currently restocking the shelves...
              </div>
            ) : (
              /* Map actual live backend products */
              products.map((item) => (
                <div key={item.id || item._id} className="snap-start shrink-0">
                  <ProductCard
                    id={item.id || item._id}
                    name={item.name}
                    price={item.price}
                    originalPrice={item.originalPrice || item.mrp}
                    /* Checks if backend sends array of images (item.imgs?.[0]) or single string (item.image) */
                    image={item.imgs?.[0] || item.image}
                    onAddToCart={(prod) => {
                      console.log("Live product added to cart:", prod);
                      // Trigger your global cart state / notification here!
                    }}
                  />
                </div>
              ))
            )}

            {/* Physical Right Spacer */}
            <div className="shrink-0 w-[12px] lg:w-[36px]" aria-hidden="true" />
          </div>

        </div>

      </div>


      {/* ========================================== */}
      {/* 💬 FIGMA EXACT: TESTIMONIALS SECTION */}
      {/* ========================================== */}

      {/* Master Root Frame: pt/pb 100px, overflow-hidden */}
      <div className="w-full pt-[100px] pb-[100px] overflow-hidden flex flex-col gap-[64px] bg-[#FFF9EE]">

        {/* --- CORE COMPONENT 1: HEADLINE + TAG --- */}
        <div className="mx-auto w-full max-w-[1312px] px-[32px] lg:px-[64px] flex flex-col items-center justify-center gap-[14px]">

          {/* Frame 1.1: Tag Pill (Exact 1:1 match with Bestsellers tag) */}
          <div className="flex items-center justify-center gap-[8px] h-[30px] rounded-full bg-[#000000]/10 pl-[4px] pr-[12px] py-[4px]">
            <TestimonialIcon />
            <span className="font-inter text-[14px] font-normal text-[#5C5140] leading-[16px] tracking-[-0.04em] whitespace-nowrap antialiased">
              Testimonials
            </span>
          </div>

          {/* Frame 1.2: Headline */}
          <h2 className="font-instrument text-[48px] font-normal text-[#222222] leading-none tracking-[-0.02em] m-0 p-0 antialiased text-center">
            What our Customers Say
          </h2>

        </div>

        {/* --- CORE COMPONENT 2: AUTO-SCROLL MARQUEE --- */}
        {/* Hovering anywhere over the track pauses the animation! */}
        <div className="relative w-full overflow-hidden hover:[&>div]:[animation-play-state:paused]">

          {/* Infinite Marquee Track (Duplicates array twice for seamless looping) */}
          <div className="animate-marquee flex flex-row gap-[20px] px-[10px]">
            {[...testimonialsMock, ...testimonialsMock].map((item, index) => {
              // Automatically loops through your 5 secondary colors
              const cardColor = secondaryColors[index % secondaryColors.length];

              return (
                <TestimonialCard
                  key={`${item.id}_${index}`}
                  quote={item.quote}
                  name={item.name}
                  location={item.location}
                  bgColor={cardColor}
                />
              );
            })}
          </div>

        </div>

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