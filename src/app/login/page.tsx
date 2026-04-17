'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get('registered') === '1';
  const justReset = params.get('reset') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnconfirmed(false);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed') || authError.message.toLowerCase().includes('not confirmed')) {
        setUnconfirmed(true);
      } else {
        setError('Identifiants incorrects.');
      }
      setLoading(false);
      return;
    }
    router.push('/chat');
  }

  async function handleResend() {
    setResendLoading(true);
    await supabase.auth.resend({ type: 'signup', email });
    setResendLoading(false);
    setResendSent(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 24px;
        }

        .logo-corner {
          display: block;
          margin-bottom: 36px;
        }

        .form-wrap {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .heading {
          font-size: 28px;
          font-weight: 500;
          color: #111;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          line-height: 1.15;
        }
        .subheading {
          font-size: 14px;
          color: #888;
          margin-bottom: 28px;
          font-weight: 400;
        }

        .success-banner {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #15803D;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .field {
          margin-bottom: 12px;
        }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
        }
        .field input {
          width: 100%;
          border: 1px solid #E2E2E2;
          border-radius: 8px;
          padding: 11px 13px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          color: #111;
          outline: none;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          -webkit-font-smoothing: antialiased;
        }
        .field input::placeholder { color: #BBB; }
        .field input:focus {
          border-color: #0B7A6A;
          box-shadow: 0 0 0 3px rgba(11, 122, 106, 0.08);
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -6px;
          margin-bottom: 16px;
        }
        .forgot-link {
          font-size: 12px;
          color: #888;
          text-decoration: none;
          font-weight: 400;
          transition: color 0.15s;
        }
        .forgot-link:hover { color: #0B7A6A; }

        .btn-primary {
          width: 100%;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
        }
        .btn-primary:hover:not(:disabled) { background: #222; }
        .btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-msg {
          font-size: 13px;
          color: #DC2626;
          margin-bottom: 12px;
          padding: 10px 12px;
          background: #FEF2F2;
          border-radius: 7px;
          border: 1px solid #FECACA;
        }

        .unconfirmed-msg {
          font-size: 13px;
          color: #92400E;
          margin-bottom: 12px;
          padding: 10px 12px;
          background: #FFFBEB;
          border-radius: 7px;
          border: 1px solid #FCD34D;
          line-height: 1.5;
        }
        .resend-btn {
          background: none;
          border: none;
          color: #0B7A6A;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-top: 6px;
          display: block;
          font-family: inherit;
        }
        .resend-btn:disabled { opacity: 0.5; }

        .terms {
          margin-top: 14px;
          text-align: center;
          font-size: 12px;
          color: #BBB;
          line-height: 1.5;
        }
        .terms a {
          color: #888;
          text-decoration: underline;
          text-decoration-color: #DDD;
        }

        .signup-row {
          margin-top: 32px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }
        .signup-row a {
          color: #111;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #E2E2E2;
          padding-bottom: 1px;
          transition: border-color 0.15s, color 0.15s;
        }
        .signup-row a:hover {
          color: #0B7A6A;
          border-color: #0B7A6A;
        }
      `}</style>

      <div className="page">
        <div className="form-wrap">
          <Link href="/" className="logo-corner" style={{ textDecoration: 'none' }}>
            <Logo height={48} />
          </Link>

          <h1 className="heading">Connexion</h1>
          <p className="subheading">pour continuer vers VetaIA</p>

          {justRegistered && (
            <div className="success-banner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#15803D"/><path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Compte créé ! Vérifiez votre email puis connectez-vous.
            </div>
          )}
          {justReset && (
            <div className="success-banner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#15803D"/><path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Mot de passe mis à jour.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="forgot-row">
              <Link href="/forgot-password" className="forgot-link">Mot de passe oublié ?</Link>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {unconfirmed && (
              <div className="unconfirmed-msg">
                Email non confirmé. Vérifiez votre boîte mail.
                {!resendSent ? (
                  <button onClick={handleResend} disabled={resendLoading} className="resend-btn">
                    {resendLoading ? 'Envoi…' : '↻ Renvoyer l\'email de confirmation'}
                  </button>
                ) : (
                  <span style={{ display: 'block', marginTop: 6, color: '#0B7A6A', fontWeight: 600 }}>✓ Email renvoyé !</span>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connexion…' : 'Continuer'}
            </button>
          </form>

          <p className="terms">
            En vous connectant, vous acceptez nos{' '}
            <a href="#">Conditions Générales</a>
          </p>

          <p className="signup-row">
            Pas encore de compte ?{' '}
            <Link href="/signup">Inscrivez-vous</Link>
          </p>
        </div>
      </div>

    </>
  );
}

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
