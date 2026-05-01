import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../sharedStyles';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/auth/register`, { firstName, lastName, email, password });
      
      // Send them straight to the gatekeeper screen
      navigate('/pending-verification', { state: { email } });
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || 'Registration failed'}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create an Account</h2>
      {error && <div style={styles.errorBox}>{error}</div>}
      <form onSubmit={handleRegister} style={styles.form}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{...styles.input, width: '100%'}} />
          <input type="text" placeholder="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={{...styles.input, width: '100%'}} />
        </div>
        <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        <button type="submit" style={styles.button}>Register</button>
      </form>
      
      <div style={styles.divider}>— OR —</div>
      <a href={`${backendUrl}/auth/google/login`} style={styles.googleBtn}>Sign up with Google</a>
      <p style={{ marginTop: '20px' }}>Already have an account? <Link to="/signin" style={styles.link}>Sign in</Link></p>
    </div>
  );
}