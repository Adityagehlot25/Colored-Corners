import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Illustration from '../assets/Illustration.svg';
import Logo from '../assets/Logo.svg';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PendingVerification() {
  const location = useLocation();
  const [statusMessage, setStatusMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const userEmail = location.state?.email; 

  const handleResend = async () => {
    if (!userEmail) return setStatusMessage('❌ Cannot resend: Email missing.');
    setIsResending(true);
    setStatusMessage('Sending...');
    try {
      const res = await axios.post(`${backendUrl}/auth/resend-verification`, { email: userEmail });
      setStatusMessage(`✅ ${res.data.message}`);
    } catch (err) {
      setStatusMessage(`❌ ${err.response?.data?.message || 'Failed to resend email.'}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#FFF9EE] text-[#5C5140] overflow-x-hidden font-sans">
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
        <div className="w-full max-w-[682px] h-[689px] shrink-0 flex items-center justify-center">
          <img src={Illustration} alt="Verification illustration" width={682} height={689} loading="eager" className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" />
        </div>

        <div className="flex flex-col w-full max-w-[479px] h-[689px] justify-center gap-[32px] shrink-0">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-[var(--text-heading-xxl-m)] leading-[var(--text-heading-xxl-m--line-height)] tracking-[var(--text-heading-xxl-m--letter-spacing)] lg:text-[var(--text-heading-xxl-d)] lg:leading-[var(--text-heading-xxl-d--line-height)] lg:tracking-[var(--text-heading-xxl-d--letter-spacing)] text-[#3A332B] font-serif">Verify Your Email</h1>
            <p className="text-[#5C5140]/80 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] max-w-[380px]">
              We&apos;ve sent a verification link to <strong>{userEmail || 'your inbox'}</strong>. Please click the link to activate your account.
            </p>
          </div>

          {statusMessage && (
            <div className={`w-full p-3 rounded-lg border text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] text-center ${statusMessage.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {statusMessage}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={isResending}
            className={`w-full h-[51px] mt-2 rounded-[10px] font-medium text-[var(--text-button-nav-m)] leading-[var(--text-button-nav-m--line-height)] tracking-[var(--text-button-nav-m--letter-spacing)] lg:text-[var(--text-button-nav-d)] lg:leading-[var(--text-button-nav-d--line-height)] lg:tracking-[var(--text-button-nav-d--letter-spacing)] flex items-center justify-center gap-2 transition-colors active:scale-[0.98] ${
              isResending ? 'bg-[#A8A296] text-[#FFF9EE] cursor-not-allowed' : 'bg-[#5F5444] text-[#FFF9EE] hover:bg-[#3A332B]'
            }`}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <div className="text-center lg:text-left">
            <Link to="/signin" className="text-[var(--text-label-eyebrow-m)] leading-[var(--text-label-eyebrow-m--line-height)] tracking-[var(--text-label-eyebrow-m--letter-spacing)] lg:text-[var(--text-label-eyebrow-d)] lg:leading-[var(--text-label-eyebrow-d--line-height)] lg:tracking-[var(--text-label-eyebrow-d--letter-spacing)] text-[#5C5140]/70 underline decoration-[#5C5140]/40 underline-offset-4 hover:text-[#3A332B] transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full bg-[#3A332B] text-[#FFF9EE] mt-auto relative rounded-t-[32px] pt-16 pb-12 px-[80px]">
        <div className="absolute left-1/2 -translate-x-1/2 -top-[120px] w-[240px] h-[460px] pointer-events-none">
          <img
            src={Logo}
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