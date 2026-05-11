'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 800);
    } else if (consent === 'declined') {
      posthog.opt_out_capturing();
    }
  }, []);

  function acceptAll() {
    localStorage.setItem('cookie-consent', 'accepted');
    posthog.opt_in_capturing();
    setVisible(false);
  }

  function savePreferences() {
    if (analyticsEnabled) {
      localStorage.setItem('cookie-consent', 'accepted');
      posthog.opt_in_capturing();
    } else {
      localStorage.setItem('cookie-consent', 'declined');
      posthog.opt_out_capturing();
    }
    setVisible(false);
  }

  function declineAll() {
    localStorage.setItem('cookie-consent', 'declined');
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        zIndex: 9998, backdropFilter: 'blur(2px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        display: 'flex', justifyContent: 'center', padding: '0 16px 24px',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'white', borderRadius: 18,
          boxShadow: '0 8px 16px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.16)',
          width: '100%', maxWidth: 560,
          overflow: 'hidden', pointerEvents: 'auto',
          border: '1px solid #EAE6DC',
        }}>
          {/* Header */}
          <div style={{
            padding: '22px 24px 18px',
            borderBottom: showDetails ? '1px solid #F0EDE6' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(11,122,106,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, flexShrink: 0,
              }}>🍪</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111D1B' }}>
                  Vos préférences de cookies
                </div>
                <div style={{ fontSize: 12, color: '#9B9589', marginTop: 1 }}>
                  VetaIA respecte votre vie privée
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#6B7280', margin: 0 }}>
              Nous utilisons des cookies pour faire fonctionner le site et, avec votre accord, analyser comment vous l'utilisez afin de l'améliorer.{' '}
              <Link href="/confidentialite" target="_blank" style={{ color: '#0B7A6A', textDecoration: 'none', fontWeight: 500 }}>
                Politique de confidentialité →
              </Link>
            </p>
          </div>

          {/* Details panel */}
          {showDetails && (
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F0EDE6' }}>
              {/* Necessary cookies */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 10, background: '#F8F7F4',
                marginBottom: 10,
              }}>
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111D1B', marginBottom: 3 }}>
                    Cookies essentiels
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.55 }}>
                    Authentification et session utilisateur (Supabase). Nécessaires au fonctionnement de l'application.
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#0B7A6A',
                  background: 'rgba(11,122,106,0.1)', borderRadius: 99,
                  padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2,
                }}>
                  Toujours actifs
                </div>
              </div>

              {/* Analytics cookies */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 10,
                border: `1.5px solid ${analyticsEnabled ? '#0B7A6A' : '#DDD9CF'}`,
                background: analyticsEnabled ? 'rgba(11,122,106,0.03)' : 'white',
                transition: 'all 0.15s',
              }}>
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111D1B', marginBottom: 3 }}>
                    Cookies d'analyse
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.55 }}>
                    Mesure d'audience anonyme via PostHog (pages visitées, fonctionnalités utilisées). Aucune donnée vendue à des tiers.
                  </div>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => setAnalyticsEnabled(v => !v)}
                  style={{
                    width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: analyticsEnabled ? '#0B7A6A' : '#D1D5DB',
                    flexShrink: 0, marginTop: 2, position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, width: 16, height: 16,
                    borderRadius: '50%', background: 'white',
                    left: analyticsEnabled ? 21 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            padding: '16px 24px',
            display: 'flex', gap: 10, alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <button onClick={() => setShowDetails(v => !v)} style={{
              padding: '10px 16px', borderRadius: 9, border: '1.5px solid #DDD9CF',
              background: 'white', fontSize: 13, fontWeight: 500, color: '#6B7280',
              cursor: 'pointer', flex: showDetails ? 'none' : '0 0 auto',
            }}>
              {showDetails ? 'Masquer les détails' : 'Personnaliser'}
            </button>

            {showDetails ? (
              <button onClick={savePreferences} style={{
                padding: '10px 20px', borderRadius: 9, border: 'none',
                background: '#0B7A6A', fontSize: 13, fontWeight: 600, color: 'white',
                cursor: 'pointer', marginLeft: 'auto',
              }}>
                Enregistrer mes choix
              </button>
            ) : (
              <>
                <button onClick={declineAll} style={{
                  padding: '10px 16px', borderRadius: 9, border: '1.5px solid #DDD9CF',
                  background: 'white', fontSize: 13, fontWeight: 500, color: '#6B7280',
                  cursor: 'pointer',
                }}>
                  Refuser
                </button>
                <button onClick={acceptAll} style={{
                  padding: '10px 20px', borderRadius: 9, border: 'none',
                  background: '#0B7A6A', fontSize: 13, fontWeight: 600, color: 'white',
                  cursor: 'pointer', marginLeft: 'auto',
                  boxShadow: '0 4px 14px rgba(11,122,106,0.3)',
                }}>
                  Tout accepter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
