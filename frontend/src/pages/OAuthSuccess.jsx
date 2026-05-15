import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Authenticating with Google... ⏳');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      alert('❌ Authentication Failed');
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
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h2>{status}</h2>
    </div>
  );
}
