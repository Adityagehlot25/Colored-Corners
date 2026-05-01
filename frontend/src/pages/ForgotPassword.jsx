import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../sharedStyles';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');
    
    try {
      const res = await axios.post(`${backendUrl}/auth/forgot-password`, { email });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || 'Request failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Enter your email and we'll send you a secure link to reset your password.
      </p>

      {error && <div style={styles.errorBox}>{error}</div>}
      
      <form onSubmit={handleForgot} style={styles.form}>
        <input 
          type="email" 
          placeholder="Email Address" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={styles.input} 
        />
        <button 
          type="submit" 
          style={{
            ...styles.button,
            background: isSubmitting ? '#ccc' : '#333',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/signin" style={styles.link}>&larr; Back to Sign In</Link>
      </div>
    </div>
  );
}