import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email... ⏳');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`${backendUrl}/auth/verify-email/${token}`);
        setStatus('✅ Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/signin'), 3000);
      } catch (err) {
        setStatus(`❌ ${err.response?.data?.message || 'Verification failed.'}`);
      }
    };
    verifyToken();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h2>{status}</h2>
    </div>
  );
}