'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', clinicName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          clinic_name: form.clinicName,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Register in Brevo + send welcome email
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        clinicName: form.clinicName,
      }),
    });

    router.push('/login?registered=1');
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F3F0EA; font-family: 'DM Sans', sans-serif; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F3F0EA; padding: 24px; }
        .card { background: #fff; border-radius: 18px; padding: 40px; width: 100%; max-width: 440px; box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.07), 0 28px 72px rgba(11,122,106,0.13); }
        .logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
        .beta { background: #E8F2EF; color: #085F52; border-radius: 100px; font-size: 10px; font-weight: 700; padding: 3px 8px; letter-spacing: 0.05em; margin-left: 4px; }
        .title { font-family: 'Newsreader', serif; font-size: 26px; font-weight: 400; color: #111D1B; margin-bottom: 6px; }
        .subtitle { font-size: 14px; color: #7A9490; margin-bottom: 24px; line-height: 1.5; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field { margin-bottom: 14px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: #4A6460; margin-bottom: 6px; letter-spacing: 0.01em; }
        .field input { width: 100%; border: 1.5px solid #DDD9CF; border-radius: 8px; padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111D1B; outline: none; transition: border-color 0.15s; background: white; }
        .field input:focus { border-color: #0B7A6A; }
        .btn { width: 100%; background: #0B7A6A; color: white; border: none; border-radius: 10px; padding: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 18px rgba(11,122,106,0.35); transition: all 0.15s; margin-top: 4px; }
        .btn:hover:not(:disabled) { background: #0D9C87; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #DC2626; font-size: 13px; margin-bottom: 14px; padding: 10px 12px; background: #FEF2F2; border-radius: 8px; }
        .footer-note { margin-top: 20px; text-align: center; font-size: 12px; color: #B5AFA6; line-height: 1.6; }
        .footer-note a { color: #0B7A6A; text-decoration: none; }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="logo-row">
            <Logo height={28} />
            <span className="beta">BETA</span>
          </div>
          <div className="title">Créer votre compte</div>
          <div className="subtitle">Accès gratuit pendant la bêta — sans carte bancaire.</div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="field">
                <label>Prénom</label>
                <input required value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Sophie" />
              </div>
              <div className="field">
                <label>Nom</label>
                <input required value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Moreau" />
              </div>
            </div>
            <div className="field">
              <label>Email professionnel</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@clinique.fr" />
            </div>
            <div className="field">
              <label>Nom de la clinique</label>
              <input required value={form.clinicName} onChange={e => set('clinicName', e.target.value)} placeholder="Clinique Vétérinaire du Parc" />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" minLength={8} />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Création en cours…' : 'Créer mon compte →'}
            </button>
          </form>

          <div className="footer-note">
            Déjà un compte ? <Link href="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </>
  );
}
