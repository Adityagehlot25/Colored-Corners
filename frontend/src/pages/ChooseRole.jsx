import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../sharedStyles';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ChooseRole() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (selectedRole) => {
    setLoading(true);
    try {
      // Grab the token they just got from Google
      const token = localStorage.getItem('token');

      // Hit the backend route we built earlier
      await axios.put(
        `${backendUrl}/auth/update-role`,
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // THE FIX: If your backend sends back a fresh JWT inside res.data.token, overwrite it!
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

      // --- THE FIX: Clean up the flag here, AFTER they successfully choose! ---
      localStorage.removeItem('needsOnboarding');

      // Setup complete! Drop them into the app.
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save role. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, textAlign: 'center', maxWidth: '500px' }}>
      <h2>Welcome to Coloured Corners! 🎉</h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Your account is verified. To customize your experience, please tell us how you plan to use the platform.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button
          onClick={() => handleRoleSelection('CUSTOMER')}
          disabled={loading}
          style={{
            ...styles.button,
            padding: '20px',
            fontSize: '18px',
            backgroundColor: '#2563EB',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🛍️ I am here to Buy
        </button>

        <button
          onClick={() => handleRoleSelection('SELLER')}
          disabled={loading}
          style={{
            ...styles.button,
            padding: '20px',
            fontSize: '18px',
            backgroundColor: '#16A34A',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🏪 I want to Sell
        </button>
      </div>
    </div>
  );
}
