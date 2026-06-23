import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast'; // 🩹 PATCH 2: Imported Toast!

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function AdminDashboard() {
  // 🩹 PATCH 1: Hook moved safely indoors!
  const [authorized, setAuthorized] = useState(false); 
  
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalSellers: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/signin');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'ADMIN') {
        toast.error("🔒 Authorized Personnel Only");
        return navigate('/dashboard');
      }
      setAuthorized(true); // <-- Unlocks the Bouncer below
    } catch (e) {
      navigate('/signin');
    }

    // Fetch Stats
    setLoading(true);
    axios.get(`${backendUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));

  }, [navigate]);

  // Fetch users when Users tab is opened
  useEffect(() => {
    if (activeTab === 'users') {
      const token = localStorage.getItem('token');
      setLoading(true);
      axios.get(`${backendUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUsers(res.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    flex: 1,
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: isActive ? '#FFF' : '#888',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s'
  });

  const tableRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr 1fr',
    gap: '16px',
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    alignItems: 'center'
  };

  const handleSuspend = (userId) => {
    const token = localStorage.getItem('token');
    axios.put(`${backendUrl}/admin/users/${userId}/suspend`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      toast.success(res.data.message); // Upgraded from alert()
      // Refresh users list
      axios.get(`${backendUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUsers(res.data)).catch(console.error);
    }).catch(err => toast.error(err.response?.data?.message || 'Action failed'));
  };

  // 🩹 PATCH 3: The physical firewall! React halts here if they aren't an Admin.
  if (!authorized) return null; 

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #FFFFFF, #888888)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🛡️ System Administration
        </h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>Platform Control Center</p>

        {/* Sub-Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>👥 User Management</button>
          <button style={tabStyle(activeTab === 'audit')} onClick={() => setActiveTab('audit')}>📋 Audit Logs</button>
        </div>

        {loading && <p style={{ color: '#888' }}>Loading database...</p>}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={glassCardStyle}>
              <h3 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Total Revenue</h3>
              <p style={{ fontSize: '32px', margin: 0, fontWeight: 'bold' }}>₹{typeof stats.totalRevenue === 'number' ? stats.totalRevenue.toLocaleString() : '0'}</p>
              <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0 0' }}>All completed orders</p>
            </div>
            <div style={glassCardStyle}>
              <h3 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Total Users</h3>
              <p style={{ fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{stats.totalUsers}</p>
              <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0 0' }}>Registered accounts</p>
            </div>
            <div style={glassCardStyle}>
              <h3 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Active Sellers</h3>
              <p style={{ fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{stats.totalSellers}</p>
              <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0 0' }}>Verified inventory owners</p>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && !loading && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            overflowX: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>User Database</h2>

            {users.length === 0 ? (
              <p style={{ color: '#888' }}>No user records found.</p>
            ) : (
              <div>
                {/* Table Header */}
                <div style={{ ...tableRowStyle, fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.05)', marginBottom: '10px' }}>
                  <div>First Name</div>
                  <div>Last Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Action</div>
                </div>

                {/* Table Rows */}
                {users.map(user => (
                  <div key={user.id} style={tableRowStyle}>
                    <div>{user.firstName}</div>
                    <div>{user.lastName}</div>
                    <div style={{ fontSize: '12px', color: '#AAA' }}>{user.email}</div>

                    <div style={{
                      background: user.role === 'ADMIN' ? 'rgba(255, 0, 0, 0.2)' : user.role === 'SELLER' ? 'rgba(100, 200, 255, 0.2)' : 'rgba(100, 255, 100, 0.2)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textAlign: 'center'
                    }}>
                      {user.role}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '12px', color: user.emailStatus === 'VERIFIED' ? '#66BB6A' : '#FFA726' }}>
                        {user.emailStatus}
                      </span>
                      {user.isSuspended && (
                        <span style={{ fontSize: '10px', background: '#DC2626', color: 'white', padding: '2px 4px', borderRadius: '2px', fontWeight: 'bold', width: 'fit-content' }}>
                          SUSPENDED
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSuspend(user.id)}
                      style={{
                        background: user.isSuspended ? 'rgba(100, 255, 100, 0.2)' : 'rgba(255, 100, 100, 0.2)',
                        border: `1px solid ${user.isSuspended ? '#66BB6A' : '#FF6B6B'}`,
                        color: user.isSuspended ? '#66BB6A' : '#FF6B6B',
                        padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                      }}
                    >
                      {user.isSuspended ? 'Restore' : 'Suspend'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h2 style={{ marginTop: 0 }}>Security Audit Logs</h2>
            <p style={{ color: '#888' }}>📋 Your new telemetry tracking system will populate here when implemented.</p>
            <p style={{ color: '#666', fontSize: '12px' }}>Tracks: Admin actions, user suspensions, role elevations, and sensitive data queries.</p>
          </div>
        )}
      </div>
    </div>
  );
}