'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get('registered') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Identifiants incorrects.');
      setLoading(false);
      return;
    }
    localStorage.setItem('leash-demo-auth', 'true');
    router.push('/chat');
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
        .logo-mark { width: 30px; height: 30px; background: #0B7A6A; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; color: #111D1B; letter-spacing: -0.02em; }
        .logo-text span { color: #0B7A6A; }
        .beta { background: #E8F2EF; color: #085F52; border-radius: 100px; font-size: 10px; font-weight: 700; padding: 3px 8px; letter-spacing: 0.05em; margin-left: 4px; }
        .title { font-family: 'Newsreader', serif; font-size: 28px; font-weight: 400; color: #111D1B; margin-bottom: 6px; }
        .subtitle { font-size: 14px; color: #7A9490; margin-bottom: 28px; line-height: 1.5; }
        .field { margin-bottom: 14px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: #4A6460; margin-bottom: 6px; letter-spacing: 0.01em; }
        .field input { width: 100%; border: 1.5px solid #DDD9CF; border-radius: 8px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111D1B; outline: none; transition: border-color 0.15s; background: white; }
        .field input:focus { border-color: #0B7A6A; }
        .btn-primary { width: 100%; background: #0B7A6A; color: white; border: none; border-radius: 10px; padding: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 18px rgba(11,122,106,0.35); transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .btn-primary:hover { background: #0D9C87; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(11,122,106,0.4); }
        .error { color: #DC2626; font-size: 13px; margin-bottom: 14px; padding: 10px 12px; background: #FEF2F2; border-radius: 8px; }
        .footer-note { margin-top: 20px; text-align: center; font-size: 12px; color: #B5AFA6; line-height: 1.6; }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="logo-row">
            <Logo height={34} />
            <span className="beta">BETA</span>
          </div>

          <h1 className="title">Bienvenue</h1>
          <p className="subtitle">Votre assistant IA vétérinaire</p>

          {justRegistered && (
            <div style={{ background: '#F0FAF7', border: '1px solid #BBE0D6', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#0B7A6A', fontWeight: 500 }}>
              ✓ Compte créé ! Vérifiez votre email puis connectez-vous.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email professionnel</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@clinique.fr" required autoComplete="email" />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="footer-note">
            Pas encore de compte ? <Link href="/signup" style={{ color: '#0B7A6A', textDecoration: 'none' }}>Créer un compte</Link>
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
