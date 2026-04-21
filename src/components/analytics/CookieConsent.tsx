'use client';

import { useState, useEffect } from 'react';
import { initAnalytics, disableAnalytics } from '../../lib/analytics';

const CONSENT_KEY = 'refinedocs_cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === 'accepted' || stored === 'declined') return stored;
  return null;
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>('accepted'); // default to hide banner on SSR
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);

    if (stored === 'accepted') {
      // User previously accepted — initialise analytics immediately
      initAnalytics();
    } else if (stored === null) {
      // No decision yet — show the banner
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
    setVisible(false);
    initAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setConsent('declined');
    setVisible(false);
    disableAnalytics();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: '#1a1c21',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '20px 24px',
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '24px', lineHeight: 1 }}>🍪</span>
          <div>
            <p
              style={{
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                margin: '0 0 4px 0',
              }}
            >
              We use cookies
            </p>
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              We use analytics cookies to understand how you use our tools and to improve your
              experience. No personal data is shared with third parties.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: '#9ca3af',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#d4ff33',
              color: '#000000',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#bce622';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#d4ff33';
            }}
          >
            Accept cookies
          </button>
        </div>
      </div>
    </div>
  );
}
