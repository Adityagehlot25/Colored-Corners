import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Authenticating with Google... ⏳');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      toast.error('Google Authentication Failed');
      return navigate('/signin');
    }

    // 1. Save the token (They are now officially logged in)
    localStorage.setItem('token', token);

    // 2. Check for the Onboarding Flag
    const needsOnboarding = localStorage.getItem('needsOnboarding');
    
    if (needsOnboarding) {
      // DO NOT DELETE THE FLAG HERE ANYMORE!
      setStatus('Redirecting to Role Selection... 🚀');
      navigate('/choose-role'); 
      return; // This return stops it from hitting the navigate('/') below
    }

    // 3. Normal Login
    setStatus('✅ Success! Redirecting to dashboard...');
    navigate('/dashboard'); 

  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9EE] text-[#5C5140] px-6 text-center">
      <h2 className="text-[var(--text-heading-xl-m)] leading-[var(--text-heading-xl-m--line-height)] tracking-[var(--text-heading-xl-m--letter-spacing)] lg:text-[var(--text-heading-xl-d)] lg:leading-[var(--text-heading-xl-d--line-height)] lg:tracking-[var(--text-heading-xl-d--letter-spacing)] text-[#3A332B] font-serif">
        {status}
      </h2>
    </div>
  );
}
