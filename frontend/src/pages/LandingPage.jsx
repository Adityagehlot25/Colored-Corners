import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Coloured Corners 🎨</h1>
      <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '40px' }}>
        Your premium e-commerce destination.
      </p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/signin" style={{ padding: '12px 24px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '16px' }}>
          Sign In
        </Link>
        <Link to="/signup" style={{ padding: '12px 24px', background: '#fff', color: '#333', border: '1px solid #333', textDecoration: 'none', borderRadius: '4px', fontSize: '16px' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
}