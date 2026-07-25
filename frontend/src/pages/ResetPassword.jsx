import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${backendUrl}/auth/reset-password/${token}`, { newPassword });
      setMessage(`✅ ${res.data.message}`);
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || 'Password reset failed'}`);
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="relative z-20"><Navbar /></div>

      <section className="relative z-10 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto pt-[64px] pb-[100px] px-[49px] gap-[64px] justify-center items-center lg:items-start">
        
        {/* Left Column */}
        <div className="w-full max-w-[682px] h-[689px] shrink-0 flex items-center justify-center">
          <img src="/Illustration.svg" alt="Reset Password" className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" />
        </div>

        {/* Right Column */}
        <div className="flex flex-col w-full max-w-[479px] h-[689px] justify-center gap-[40px] shrink-0">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-[var(--text-heading-xxl-m)] leading-[var(--text-heading-xxl-m--line-height)] tracking-[var(--text-heading-xxl-m--letter-spacing)] lg:text-[var(--text-heading-xxl-d)] lg:leading-[var(--text-heading-xxl-d--line-height)] lg:tracking-[var(--text-heading-xxl-d--letter-spacing)] text-[#3A332B] font-serif">Set New Password</h1>
            <p className="text-[#5C5140]/80 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] max-w-[380px]">
              Enter your new password below. Ensure it is secure.
            </p>
          </div>

          {error && <div className="w-full p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] text-center">{error}</div>}
          {message && <div className="w-full p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] text-center">{message}</div>}

          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <input 
              type="password" 
              required 
              minLength="6" 
              placeholder="New Password"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full h-[51px] px-4 rounded-[10px] bg-white border border-[#E8E1D3] focus:border-[#5C5140] outline-none placeholder:text-[#5C5140]/50 text-[var(--text-body-s-m)] leading-[var(--text-body-s-m--line-height)] tracking-[var(--text-body-s-m--letter-spacing)] lg:text-[var(--text-body-s-d)] lg:leading-[var(--text-body-s-d--line-height)] lg:tracking-[var(--text-body-s-d--letter-spacing)] transition-all shadow-sm"
            />
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full h-[51px] mt-2 text-[#FFF9EE] rounded-[10px] font-medium text-[var(--text-button-nav-m)] leading-[var(--text-button-nav-m--line-height)] tracking-[var(--text-button-nav-m--letter-spacing)] lg:text-[var(--text-button-nav-d)] lg:leading-[var(--text-button-nav-d--line-height)] lg:tracking-[var(--text-button-nav-d--letter-spacing)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isSubmitting ? 'bg-[#A8A296] cursor-not-allowed' : 'bg-[#5F5444] hover:bg-[#3A332B]'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}