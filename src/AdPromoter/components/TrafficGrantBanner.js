// AdPromoter/components/TrafficGrantBanner.js
// Drop this inside WebsiteDetails.js (or any authenticated page).
// It quietly checks if the logged-in user has a pending grant,
// and if so shows a non-intrusive banner/button.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function TrafficGrantBanner({ websiteId }) {
  const navigate = useNavigate();
  const [grant,    setGrant]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/api/admin/user-grant-status')
      .then(res => {
        if (res.data.hasGrant) {
          // Only show if the grant is for this website OR is website-agnostic
          const grantWebsiteId = res.data.websiteId;
          if (!grantWebsiteId || grantWebsiteId === websiteId) {
            setGrant(res.data);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [websiteId]);

  if (loading || !grant || dismissed) return null;

  const handleClick = () => {
    navigate(`/traffic-grant?token=${grant.accessToken}`);
  };

  const expiresIn = Math.ceil((new Date(grant.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>📊</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 3 }}>
            You have an analytics boost available!
          </div>
          <div style={{ color: '#aaa', fontSize: 13, lineHeight: 1.5 }}>
            Set your own traffic &amp; views numbers for this website.
            {expiresIn > 0 && <span style={{ color: '#f6ad55', marginLeft: 6 }}>Expires in {expiresIn} day{expiresIn !== 1 ? 's' : ''}.</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={handleClick}
          style={{
            background: '#fff',
            color: '#111',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          Set My Numbers →
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18, padding: '4px 6px' }}
          title="Dismiss (link still valid)"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
