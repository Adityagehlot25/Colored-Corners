import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

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
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', margin: '0' }}>✉️</h1>
      <h2>Verify Your Email</h2>
      <p style={{ color: '#555', lineHeight: '1.5' }}>
        We've sent a verification link to <strong>{userEmail || 'your inbox'}</strong>. <br/>
        Please click the link to activate your account.
      </p>
      <div style={{ marginTop: '30px' }}>
        <button onClick={handleResend} disabled={isResending} style={{ padding: '10px 20px', background: isResending ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isResending ? 'not-allowed' : 'pointer' }}>
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </button>
        {statusMessage && <div style={{ fontWeight: 'bold', marginTop: '10px' }}>{statusMessage}</div>}
      </div>
      <Link to="/signin" style={{ display: 'inline-block', marginTop: '30px', color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Back to Sign In</Link>
    </div>
  );
}