'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F3F0EA; font-family: 'DM Sans', sans-serif; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F3F0EA; padding: 24px; }
        .card { background: #fff; border-radius: 18px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.07), 0 28px 72px rgba(11,122,106,0.13); }
        .logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
        .title { font-family: 'Newsreader', serif; font-size: 26px; font-weight: 400; color: #111D1B; margin-bottom: 6px; }
        .subtitle { font-size: 14px; color: #7A9490; margin-bottom: 28px; line-height: 1.5; }
        .field { margin-bottom: 14px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: #4A6460; margin-bottom: 6px; letter-spacing: 0.01em; }
        .field input { width: 100%; border: 1.5px solid #DDD9CF; border-radius: 8px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111D1B; outline: none; transition: border-color 0.15s; background: white; }
        .field input:focus { border-color: #0B7A6A; }
        .btn { width: 100%; background: #0B7A6A; color: white; border: none; border-radius: 10px; padding: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 18px rgba(11,122,106,0.35); transition: all 0.15s; }
        .btn:hover:not(:disabled) { background: #0D9C87; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #DC2626; font-size: 13px; margin-bottom: 14px; padding: 10px 12px; background: #FEF2F2; border-radius: 8px; }
        .success { color: #0B7A6A; font-size: 13px; padding: 12px 14px; background: #F0FAF7; border: 1px solid #BBE0D6; border-radius: 8px; line-height: 1.6; }
        .footer-note { margin-top: 20px; text-align: center; font-size: 12px; color: #B5AFA6; }
        .footer-note a { color: #0B7A6A; text-decoration: none; }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="logo-row">
            <Logo height={34} />
          </div>
          <h1 className="title">Mot de passe oublié</h1>
          <p className="subtitle">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>

          {sent ? (
            <div className="success">
              ✓ Email envoyé ! Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email professionnel</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@clinique.fr" required autoComplete="email" />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Envoi…' : 'Envoyer le lien →'}
              </button>
            </form>
          )}

          <p className="footer-note" style={{ marginTop: 20 }}>
            <Link href="/login">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </>
  );
}
