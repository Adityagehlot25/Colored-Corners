import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../sharedStyles';

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
      // Send them to login after 3 seconds so they can use the new password
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || 'Password reset failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Set New Password</h2>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Please enter your new password below. It must be at least 6 characters long.
      </p>

      {error && <div style={styles.errorBox}>{error}</div>}
      
      <form onSubmit={handleReset} style={styles.form}>
        <input 
          type="password" 
          placeholder="New Password" 
          required 
          minLength="6" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
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
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  );
}