import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Illustration from '../assets/Illustration.svg';
import Logo from '../assets/Logo.svg';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignUpPage() {
  // Application State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // Kept for API, removed from UI
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    try {
      const res = await axios.post(`${backendUrl}/auth/register`, { 
        firstName, 
        lastName, 
        email, 
        password, 
        role 
      });
      
      localStorage.setItem('token', res.data.token);

      // Send them to role selection first, then continue the onboarding flow.
      navigate('/choose-role', { state: { fromSignup: true, email } });
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || 'Registration failed'}`);
    }
  };

  const handleGoogleSignup = () => {
    // Drop a flag so the success page knows to trigger onboarding
    localStorage.setItem('needsOnboarding', 'true');
    window.location.href = `${backendUrl}/auth/google/login`;
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#FFF9EE] text-[#5C5140] overflow-x-hidden font-sans">

      {/* Background Dot Grid (Spans across the hero section) */}
      <div
        className="absolute top-[80px] left-0 w-full h-[800px] pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(92, 80, 64, 0.15) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          maskImage: 'linear-gradient(180deg, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 60%, transparent 100%)'
        }}
      />

      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto pt-[64px] pb-[100px] px-[49px] gap-[64px] justify-center items-center lg:items-start">
        
        {/* Left Column: Illustration (Fixed 682px width) */}
        <div className="w-full max-w-[682px] h-[689px] shrink-0 flex items-center justify-center">
          <img
            src={Illustration}
            alt="Handcrafted Treasures Showcase"
            width={682}
            height={689}
            loading="eager"
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
          />
        </div>

        {/* Right Column: Log in Section (Fixed 479px width) */}
        <div className="flex flex-col w-full max-w-[479px] h-[689px] justify-center gap-[40px] shrink-0">
          
          {/* Headline + Subtext */}
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-[42px] leading-[110%] text-[#3A332B] font-serif tracking-tight">
              Create Your Account
            </h1>
            <p className="text-[#5C5140]/80 text-[15px] leading-[150%] max-w-[380px]">
              Create your account to discover and share handcrafted creations.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="w-full p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[14px] text-center">
              {error}
            </div>
          )}

          {/* Input Container + CTA */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            
            {/* Row: First & Last Name */}
            <div className="flex gap-4">
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name" 
                className="flex-1 h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[15px] transition-all shadow-sm"
              />
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name" 
                className="flex-1 h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[15px] transition-all shadow-sm"
              />
            </div>
            
            {/* Email */}
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Eg. johndoe@gmail.com" 
              className="w-full h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[15px] transition-all shadow-sm"
            />
            
            {/* Password */}
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create Password" 
              className="w-full h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[15px] transition-all shadow-sm"
            />
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full h-[51px] mt-2 bg-[#5F5444] text-[#FFF9EE] rounded-[10px] font-medium text-[16px] flex items-center justify-center gap-2 hover:bg-[#3A332B] transition-colors active:scale-[0.98]"
            >
              Sign Up <span className="text-xl leading-none">→</span>
            </button>
          </form>

          {/* Section Divider */}
          <div className="flex items-center justify-center gap-4 w-full">
            <div className="h-[1px] w-full bg-[#5C5140]/15"></div>
            <span className="text-[12px] text-[#5C5140]/60 tracking-widest uppercase">OR</span>
            <div className="h-[1px] w-full bg-[#5C5140]/15"></div>
          </div>

          {/* Socials & Login Redirect */}
          <div className="flex flex-col gap-6">
            <button 
              type="button" 
              onClick={handleGoogleSignup}
              className="w-full h-[51px] bg-white border border-[#E8E1D3] rounded-[10px] flex items-center justify-center gap-3 hover:bg-[#FDFBF7] transition-colors shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[14px] font-medium text-[#3A332B]">Sign in with Google</span>
            </button>

            <div className="text-center text-[13px] text-[#5C5140]">
              Already have an account? <Link to="/signin" className="underline decoration-[#5C5140]/40 underline-offset-4 hover:text-[#3A332B] font-medium transition-colors">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Container */}
      <footer className="w-full bg-[#3A332B] text-[#FFF9EE] mt-auto relative rounded-t-[32px] pt-16 pb-12 px-[80px]">
        
        {/* House Illustration overlap */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[120px] w-[240px] h-[460px] pointer-events-none">
           <img 
             src={Logo} 
             alt="Coloured Corners Brand Icon" 
             className="w-full h-full object-contain object-bottom drop-shadow-md" 
           />
        </div>

        <div className="max-w-[1280px] mx-auto flex flex-wrap justify-between relative z-10 gap-12">
          
          <div className="flex gap-20 text-[14px] leading-[150%]">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-[#E6D3B3] mb-2 tracking-wide">Shop</h4>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Tableware</Link>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Bags & Pouches</Link>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Beddings</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-[#E6D3B3] mb-2 tracking-wide">Help</h4>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Shipping & Delivery</Link>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Returns & Exchange</Link>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">FAQs</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-[#E6D3B3] mb-2 tracking-wide">About</h4>
              <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Our Story</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h4 className="font-semibold text-[#E6D3B3] mb-4 text-[14px] tracking-wide">Subscribe for latest Products</h4>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Enter Mail" 
                  className="w-[280px] h-10 px-4 bg-white/10 rounded border border-white/20 outline-none placeholder:text-white/50 text-[14px] focus:border-[#E6D3B3] transition-colors"
                />
                <button className="w-fit px-6 h-10 bg-[#FFF9EE] text-[#3A332B] text-[14px] font-semibold rounded hover:bg-[#E6D3B3] transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-[14px] opacity-80 mb-1">Say hi</p>
              <a href="mailto:hello@colouredcorners.com" className="font-serif text-[24px] hover:text-[#E6D3B3] transition-colors">
                hello@colouredcorners.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}