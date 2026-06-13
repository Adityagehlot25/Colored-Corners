import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../sharedStyles';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // <-- NEW: State for Role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // <-- NEW: Pass the selected role to the backend
      await axios.post(`${backendUrl}/auth/register`, { firstName, lastName, email, password, role });
      
      // Send them straight to the gatekeeper screen
      navigate('/pending-verification', { state: { email } });
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
        
        {/* --- Dropdown for Role Selection --- */}
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          style={{ ...styles.input, backgroundColor: '#1E1E1E', color: '#FFF', cursor: 'pointer', border: '1px solid #333' }}
        >
          <option value="CUSTOMER">I am a Customer</option>
          <option value="SELLER">I want to Sell</option>
        </select>
        {/* ----------------------------------- */}

        <button type="submit" style={{ ...styles.button, marginTop: '10px' }}>Register</button>
      </form>
      
      <div style={styles.divider}>— OR —</div>
      
      {/* --- UPDATED GOOGLE BUTTON --- */}
      <button 
        type="button" 
        onClick={handleGoogleSignup} 
        style={{...styles.googleBtn, border: 'none', width: '100%', cursor: 'pointer'}}
      >
        Sign up with Google
      </button>
      
      <p style={{ marginTop: '20px' }}>Already have an account? <Link to="/signin" style={styles.link}>Sign in</Link></p>
    </div>
  );
}