// pages/TrafficGrant.js  — add this to the main React app's router
// Route: /traffic-grant?token=XXX
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TIERS = [
  { label: 'Starter',  min: 500,    max: 2000,   color: '#718096' },
  { label: 'Basic',    min: 2001,   max: 10000,  color: '#3182ce' },
  { label: 'Standard', min: 10001,  max: 50000,  color: '#38a169' },
  { label: 'Premium',  min: 50001,  max: 200000, color: '#d69e2e' },
  { label: 'Elite',    min: 200001, max: 999999, color: '#e53e3e' },
];

function getTier(n) {
  return TIERS.slice().reverse().find(t => n >= t.min) || null;
}

export default function TrafficGrant() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token');

  const [status,  setStatus]  = useState('loading'); // loading | invalid | expired | revoked | alreadyUsed | ready | submitting | success
  const [grant,   setGrant]   = useState(null);
  const [error,   setError]   = useState('');

  // Form state
  const [traffic, setTraffic] = useState('');
  const [views,   setViews]   = useState('');
  const [result,  setResult]  = useState(null);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    api.get(`/api/admin/grant-check?token=${token}`)
      .then(res => {
        const d = res.data;
        if (d.alreadyUsed) { setStatus('alreadyUsed'); setGrant(d.grant); return; }
        setGrant(d.grant);
        setStatus('ready');
      })
      .catch(err => {
        const msg = err.response?.data?.message || '';
        if (msg.includes('expired')) setStatus('expired');
        else if (msg.includes('revoked')) setStatus('revoked');
        else setStatus('invalid');
        setError(msg);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = parseInt(traffic) || 0;
    const v = parseInt(views)   || 0;
    if (t <= 0 && v <= 0) { setError('Please enter at least one number above 0.'); return; }
    setError('');
    setStatus('submitting');
    try {
      const res = await api.post('/api/admin/grant-apply', { token, traffic: t, views: v });
      setResult(res.data);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('ready');
    }
  };

  // ── Render states ────────────────────────────────────────────────────────────

  if (status === 'loading') return <Shell><Spinner /></Shell>;

  if (status === 'invalid') return (
    <Shell>
      <StatusCard icon="🔗" title="Invalid link" color="#e53e3e"
        desc="This link doesn't exist or has already been removed. Please contact support if you think this is a mistake." />
    </Shell>
  );

  if (status === 'expired') return (
    <Shell>
      <StatusCard icon="⏰" title="Link expired" color="#718096"
        desc="This personalized link has expired. Please contact support to request a new one." />
    </Shell>
  );

  if (status === 'revoked') return (
    <Shell>
      <StatusCard icon="🚫" title="Link revoked" color="#e53e3e"
        desc="This link has been revoked by an administrator. Please contact support if you have questions." />
    </Shell>
  );

  if (status === 'alreadyUsed') return (
    <Shell>
      <StatusCard icon="✅" title="Already completed" color="#38a169"
        desc={`You've already set your analytics numbers for ${grant?.websiteId?.websiteName || 'your website'}. Your analytics dashboard has been updated.`}
        action={<button onClick={() => navigate('/websites')} style={btnStyle('#111','#fff')}>Go to My Websites →</button>}
      />
    </Shell>
  );

  if (status === 'success') {
    const tier = getTier(result.monthlyTraffic);
    return (
      <Shell>
        <div style={card}>
          <div style={{ textAlign: 'center', padding: '8px 0 24px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 700 }}>Analytics Updated!</h2>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Your website's analytics have been updated successfully.
            </p>

            {tier && (
              <div style={{ background: '#f8f8f8', borderRadius: 10, padding: '16px 24px', marginBottom: 24, display: 'inline-block' }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Your traffic tier</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: tier.color }}>{tier.label}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{result.monthlyTraffic.toLocaleString()} monthly visitors</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => navigate('/websites')} style={btnStyle('#111', '#fff')}>
                View My Analytics →
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Ready / submitting form ──────────────────────────────────────────────────
  const websiteName = grant?.websiteId?.websiteName || 'your website';
  const currentTraffic = grant?.websiteId?.monthlyTraffic || 0;

  return (
    <Shell>
      <div style={card}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: 22, fontWeight: 700, color: '#111' }}>
            Set Your Analytics Numbers
          </h2>
          <p style={{ margin: 0, color: '#888', fontSize: 14, lineHeight: 1.6 }}>
            For <strong style={{ color: '#333' }}>{websiteName}</strong>. These numbers will appear in your analytics dashboard.
          </p>
        </div>

        {/* Current stats */}
        {currentTraffic > 0 && (
          <div style={{ background: '#f8f8f8', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#666' }}>
            Current monthly traffic: <strong style={{ color: '#111' }}>{currentTraffic.toLocaleString()}</strong>
          </div>
        )}

        {/* Tier guide */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 10, fontWeight: 500 }}>TRAFFIC TIERS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TIERS.map(t => (
              <div key={t.label} style={{ background: '#f8f8f8', borderRadius: 6, padding: '6px 12px', fontSize: 12 }}>
                <span style={{ color: t.color, fontWeight: 600 }}>{t.label}</span>
                <span style={{ color: '#aaa', marginLeft: 6 }}>{t.min.toLocaleString()}+</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Monthly Traffic</label>
              <input
                type="number"
                min="0"
                max="9999999"
                style={inputStyle}
                value={traffic}
                onChange={e => setTraffic(e.target.value)}
                placeholder="e.g. 25000"
              />
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Unique visitors per month</div>
            </div>
            <div>
              <label style={labelStyle}>Monthly Views</label>
              <input
                type="number"
                min="0"
                max="9999999"
                style={inputStyle}
                value={views}
                onChange={e => setViews(e.target.value)}
                placeholder="e.g. 50000"
              />
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Total page views per month</div>
            </div>
          </div>

          {/* Live tier preview */}
          {(parseInt(traffic) > 0 || parseInt(views) > 0) && (() => {
            const n = Math.max(parseInt(traffic)||0, parseInt(views)||0);
            const t = getTier(n);
            return t ? (
              <div style={{ background: '#f0fff4', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📈</span>
                <div style={{ fontSize: 14 }}>
                  Your tier will be <strong style={{ color: t.color }}>{t.label}</strong> with {n.toLocaleString()} monthly visitors.
                </div>
              </div>
            ) : null;
          })()}

          {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 16 }}>{error}</p>}

          {/* Info note */}
          <div style={{ background: '#fffbeb', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
            ⚠️ This is a one-time action. Once confirmed, these numbers will update your analytics and this link will no longer be usable.
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{ width: '100%', ...btnStyle('#111', '#fff'), opacity: status === 'submitting' ? 0.7 : 1, fontSize: 15 }}
          >
            {status === 'submitting' ? 'Updating analytics…' : 'Confirm & Update Analytics →'}
          </button>
        </form>
      </div>
    </Shell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Shell = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
    <div style={{ width: '100%', maxWidth: 520 }}>{children}</div>
  </div>
);

const StatusCard = ({ icon, title, color, desc, action }) => (
  <div style={card}>
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h2 style={{ margin: '0 0 10px 0', fontSize: 22, fontWeight: 700, color }}>{title}</h2>
      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px 0' }}>{desc}</p>
      {action}
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading…</div>
);

const card      = { background: '#fff', borderRadius: 14, padding: 36, boxShadow: '0 2px 20px rgba(0,0,0,0.08)' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 };
const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 15, outline: 'none', fontFamily: 'inherit' };
const btnStyle  = (bg, color) => ({ display: 'inline-block', background: bg, color, border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', textDecoration: 'none' });
