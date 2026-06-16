import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../sharedStyles';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Grab the anonymous guest ID from local storage (if it exists)
      const guestId = localStorage.getItem('guestId');

      // 2. Pass the guestId in the payload so the backend can merge the cart!
      const res = await axios.post(`${backendUrl}/auth/login`, {
        email,
        password,
        guestId // <-- THE FIX: Backend catches this to merge the carts
      });

      // Save the new permanent token
      localStorage.setItem('token', res.data.token);

      // Optional: Clean up the guestId since they are now a real user
      localStorage.removeItem('guestId');

      // Read the redirect parameter from the URL
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      // Force the path to be relative to our domain
      const safeRedirect = redirectUrl.startsWith('/') ? redirectUrl : '/dashboard';
      // Hard redirect to flush React Context and recognize the new login state instantly
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

  return (
    <div style={styles.container}>
      <h2>Sign In</h2>
      {error && <div style={styles.errorBox}>{error}</div>}
      <form onSubmit={handleLogin} style={styles.form}>
        <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
      </form>

      <div style={{ marginTop: '10px', textAlign: 'right' }}>
        <Link to="/forgot-password" style={{ fontSize: '14px', color: '#555' }}>Forgot Password?</Link>
      </div>

      <div style={styles.divider}>— OR —</div>
      <a href={`${backendUrl}/auth/google/login`} style={styles.googleBtn}>Sign in with Google</a>
      <p style={{ marginTop: '20px' }}>Don't have an account? <Link to="/signup" style={styles.link}>Register here</Link></p>
    </div>
  );
}