'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
    else if (consent === 'declined') posthog.opt_out_capturing();
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    posthog.opt_in_capturing();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 48px)', maxWidth: 560,
      background: 'white', borderRadius: 14,
      boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.12)',
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14,
      border: '1px solid #EAE6DC',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🍪</span>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#4A5568', margin: 0 }}>
          Nous utilisons des cookies d'analyse (PostHog) pour comprendre comment vous utilisez VetaIA et améliorer le service. Les cookies d'authentification sont nécessaires au fonctionnement.{' '}
          <Link href="/confidentialite" style={{ color: '#0B7A6A', textDecoration: 'none', fontWeight: 500 }}>
            En savoir plus
          </Link>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={decline} style={{
          padding: '9px 18px', borderRadius: 8, border: '1.5px solid #DDD9CF',
          background: 'white', fontSize: 13, fontWeight: 500, color: '#6B7280', cursor: 'pointer',
        }}>
          Refuser
        </button>
        <button onClick={accept} style={{
          padding: '9px 18px', borderRadius: 8, border: 'none',
          background: '#0B7A6A', fontSize: 13, fontWeight: 500, color: 'white', cursor: 'pointer',
        }}>
          Accepter
        </button>
      </div>
    </div>
  );
}
