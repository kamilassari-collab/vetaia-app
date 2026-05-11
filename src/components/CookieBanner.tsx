'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setTimeout(() => setVisible(true), 600);
    else if (consent === 'declined') posthog.opt_out_capturing();
  }, []);

  function acceptAll() {
    localStorage.setItem('cookie-consent', 'accepted');
    posthog.opt_in_capturing();
    setVisible(false);
  }

  function declineAll() {
    localStorage.setItem('cookie-consent', 'declined');
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 680,
      background: '#1A1A1A', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
      flexWrap: 'wrap',
    }}>
      <p style={{
        flex: 1, minWidth: 220,
        fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)',
        margin: 0,
      }}>
        Nous utilisons des cookies pour améliorer votre expérience et à des fins de mesure d'audience. Pour en savoir plus, consultez notre{' '}
        <Link href="/confidentialite" target="_blank" style={{
          color: 'rgba(255,255,255,0.55)', textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}>
          Politique relative aux cookies
        </Link>.
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={declineAll} style={{
          padding: '9px 18px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent', fontSize: 13, fontWeight: 500,
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          Tout refuser
        </button>
        <button onClick={acceptAll} style={{
          padding: '9px 20px', borderRadius: 8, border: 'none',
          background: '#0B7A6A', fontSize: 13, fontWeight: 600,
          color: 'white', cursor: 'pointer', whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(11,122,106,0.4)',
        }}>
          Tout accepter
        </button>
      </div>
    </div>
  );
}
