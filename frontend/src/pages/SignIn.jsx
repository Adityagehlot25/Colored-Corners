import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';


const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const guestId = localStorage.getItem('guestId');
      const res = await axios.post(`${backendUrl}/auth/login`, {
        email,
        password,
        guestId
      });

      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('guestId');

      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      const safeRedirect = redirectUrl.startsWith('/') ? redirectUrl : '/dashboard';
      window.location.href = safeRedirect;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      if (err.response?.status === 403 && errorMessage.includes('verify')) {
        navigate('/pending-verification', { state: { email } });
      } else {
        setError(`❌ ${errorMessage}`);
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google/login`;
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#FFF9EE] text-[#5C5140] overflow-x-hidden font-sans">
      {/* Background Dot Grid */}
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

      <section className="relative z-10 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto pt-[64px] pb-[100px] px-[49px] gap-[64px] justify-center items-center lg:items-start">
        
        {/* Left Column: Illustration */}
        <div className="w-full max-w-[682px] h-[689px] shrink-0 flex items-center justify-center">
          <img src="/Illustration.svg" alt="Handcrafted Treasures Showcase" width={682} height={689} loading="eager" className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" />
        </div>

        {/* Right Column: Sign In Section */}
        <div className="flex flex-col w-full max-w-[479px] h-[689px] justify-center gap-[40px] shrink-0">
          
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-[var(--text-heading-xxl-m)] leading-[var(--text-heading-xxl-m--line-height)] tracking-[var(--text-heading-xxl-m--letter-spacing)] lg:text-[var(--text-heading-xxl-d)] lg:leading-[var(--text-heading-xxl-d--line-height)] lg:tracking-[var(--text-heading-xxl-d--letter-spacing)] text-[#3A332B] font-serif">Welcome Back</h1>
            <p className="text-[#5C5140]/80 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] max-w-[380px]">
              Sign in to your account to continue your journey.
            </p>
          </div>

          {error && (
            <div className="w-full p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" 
              className="w-full h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] transition-all shadow-sm"
            />
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] transition-all shadow-sm"
            />

            <div className="text-right -mt-1">
              <Link to="/forgot-password" className="text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)] text-[#5C5140]/70 underline decoration-[#5C5140]/40 underline-offset-4 hover:text-[#3A332B] transition-colors">
                Forgot Password?
              </Link>
            </div>
            
            <button type="submit" className="w-full h-[51px] mt-2 bg-[#5F5444] text-[#FFF9EE] rounded-[10px] font-medium text-[var(--text-button-nav-m)] leading-[var(--text-button-nav-m--line-height)] tracking-[var(--text-button-nav-m--letter-spacing)] lg:text-[var(--text-button-nav-d)] lg:leading-[var(--text-button-nav-d--line-height)] lg:tracking-[var(--text-button-nav-d--letter-spacing)] flex items-center justify-center gap-2 hover:bg-[#3A332B] transition-colors active:scale-[0.98]">
              Sign In <span className="text-xl leading-none">→</span>
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 w-full">
            <div className="h-[1px] w-full bg-[#5C5140]/15"></div>
            <span className="text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)] text-[#5C5140]/60 uppercase">OR</span>
            <div className="h-[1px] w-full bg-[#5C5140]/15"></div>
          </div>

          <div className="flex flex-col gap-6">
            <button type="button" onClick={handleGoogleLogin} className="w-full h-[51px] bg-white border border-[#E8E1D3] rounded-[10px] flex items-center justify-center gap-3 hover:bg-[#FDFBF7] transition-colors shadow-sm active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)] font-medium text-[#3A332B]">Sign in with Google</span>
            </button>

            <div className="text-center text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)] text-[#5C5140]">
              Don't have an account? <Link to="/signup" className="underline decoration-[#5C5140]/40 underline-offset-4 hover:text-[#3A332B] font-medium transition-colors">Register here</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Container */}
            <footer className="w-full bg-[#3A332B] text-[#FFF9EE] mt-auto relative rounded-t-[32px] pt-16 pb-12 px-[80px]">
              
              {/* House Illustration overlap */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-[120px] w-[240px] h-[460px] pointer-events-none">
                 <img 
                   src="/Logo.svg"
                   alt="Coloured Corners Brand Icon" 
                   className="w-full h-full object-contain object-bottom drop-shadow-md" 
                 />
              </div>
      
              <div className="max-w-[1280px] mx-auto flex flex-wrap justify-between relative z-10 gap-12">
                
                <div className="flex gap-20 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)]">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold text-[#E6D3B3] mb-2 text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)]">Shop</h4>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Tableware</Link>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Bags & Pouches</Link>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Beddings</Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold text-[#E6D3B3] mb-2 text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)]">Help</h4>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Shipping & Delivery</Link>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Returns & Exchange</Link>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">FAQs</Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold text-[#E6D3B3] mb-2 text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)]">About</h4>
                    <Link to="#" className="opacity-80 hover:opacity-100 hover:text-[#E6D3B3] transition-colors">Our Story</Link>
                  </div>
                </div>
      
                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className="font-semibold text-[#E6D3B3] mb-4 text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)]">Subscribe for latest Products</h4>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="email" 
                        placeholder="Enter Mail" 
                        className="w-[280px] h-10 px-4 bg-white/10 rounded border border-white/20 outline-none placeholder:text-white/50 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] focus:border-[#E6D3B3] transition-colors"
                      />
                      <button className="w-fit px-6 h-10 bg-[#FFF9EE] text-[#3A332B] text-[var(--text-button-nav-m)] leading-[var(--text-button-nav-m--line-height)] tracking-[var(--text-button-nav-m--letter-spacing)] lg:text-[var(--text-button-nav-d)] lg:leading-[var(--text-button-nav-d--line-height)] lg:tracking-[var(--text-button-nav-d--letter-spacing)] font-semibold rounded hover:bg-[#E6D3B3] transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] opacity-80 mb-1">Say hi</p>
                    <a href="mailto:hello@colouredcorners.com" className="font-serif text-[var(--text-heading-l-m)] leading-[var(--text-heading-l-m--line-height)] tracking-[var(--text-heading-l-m--letter-spacing)] lg:text-[var(--text-heading-l-d)] lg:leading-[var(--text-heading-l-d--line-height)] lg:tracking-[var(--text-heading-l-d--letter-spacing)] hover:text-[#E6D3B3] transition-colors">
                      hello@colouredcorners.com
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        );
      }