'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the URL hash after redirect
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push('/login?reset=1');
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
        .field label { display: block; font-size: 12px; font-weight: 500; color: #4A6460; margin-bottom: 6px; }
        .field input { width: 100%; border: 1.5px solid #DDD9CF; border-radius: 8px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111D1B; outline: none; transition: border-color 0.15s; background: white; }
        .field input:focus { border-color: #0B7A6A; }
        .btn { width: 100%; background: #0B7A6A; color: white; border: none; border-radius: 10px; padding: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 18px rgba(11,122,106,0.35); transition: all 0.15s; }
        .btn:hover:not(:disabled) { background: #0D9C87; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #DC2626; font-size: 13px; margin-bottom: 14px; padding: 10px 12px; background: #FEF2F2; border-radius: 8px; }
        .waiting { font-size: 14px; color: #7A9490; text-align: center; padding: 20px 0; }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="logo-row">
            <Logo height={34} />
          </div>
          <h1 className="title">Nouveau mot de passe</h1>
          <p className="subtitle">Choisissez un nouveau mot de passe pour votre compte.</p>

          {!ready ? (
            <p className="waiting">Vérification du lien…</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Nouveau mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
              </div>
              <div className="field">
                <label>Confirmer le mot de passe</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required minLength={8} />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Mise à jour…' : 'Mettre à jour →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
