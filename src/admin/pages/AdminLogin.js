// admin/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminFetch } from '../utils/adminApi';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();
  const [secret, setSecret] = useState('');
  const [user,   setUser]   = useState('admin');
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Verify credentials against the stats endpoint (lightweight ping)
      await adminFetch('/stats', {}, { 'x-admin-secret': secret, 'x-admin-user': user, 'Content-Type': 'application/json' });
      login(secret, user);
      navigate('/admin');
    } catch {
      setError('Invalid admin secret. Check your ADMIN_SECRET env var.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: 24, fontWeight: 700, color: '#111' }}>Yepper Admin</h1>
        <p style={{ margin: '0 0 28px 0', color: '#888', fontSize: 14 }}>Enter your admin credentials to continue</p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Admin username</label>
          <input
            style={inputStyle}
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="admin"
            required
          />

          <label style={labelStyle}>Admin secret</label>
          <input
            type="password"
            style={inputStyle}
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="••••••••••••"
            required
            autoFocus
          />

          {error && <p style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 16px 0' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 };
const inputStyle = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px',
  fontSize: 14, marginBottom: 16, outline: 'none',
  fontFamily: 'inherit',
};
