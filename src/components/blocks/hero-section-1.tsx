'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Send } from 'lucide-react';
import React from 'react';
import { Logo } from '@/components/Logo';

// ─── Constants ─────────────────────────────────────────────────────────────────
const CALENDLY_URL = 'https://calendly.com/kamilassari/30min';

const DEMO_QUESTIONS = [
  { emoji: '💊', text: 'Dosage amoxicilline pour un chat de 4 kg ?' },
  { emoji: '🫀', text: 'Signes cliniques insuffisance rénale féline' },
  { emoji: '🐰', text: 'Protocole anesthésie pour un lapin' },
];

// ─── Mini Chat Widget ────────────────────────────────────────────────────────────
// Redirects to /demo — a clean, isolated page with a 3-question cap.
// Never touches the demo account at /chat.
function MiniChatDemo() {
  const router = useRouter();
  const [input, setInput] = useState('');

  function launch(question: string) {
    if (!question.trim()) return;
    sessionStorage.setItem('demo-prefill', question.trim());
    router.push('/demo');
  }

  return (
    <div style={{ background: 'white', borderRadius: 22, border: '1px solid #DDD9CF', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 16px 48px rgba(11,122,106,0.12)', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #DDD9CF', display: 'flex', alignItems: 'center', gap: 10, background: '#FAFAF8' }}>
        <Logo mark height={32} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111D1B', fontFamily: "'DM Sans', sans-serif" }}>Vetaia — Assistant vétérinaire</div>
          <div style={{ fontSize: 11, color: '#7A9490', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            En ligne · Répond en quelques secondes
          </div>
        </div>
      </div>

      {/* Suggested questions */}
      <div style={{ padding: '20px 20px 16px', background: '#F3F0EA' }}>
        <p style={{ fontSize: 12.5, color: '#7A9490', fontFamily: "'DM Sans', sans-serif", marginBottom: 12, textAlign: 'center' }}>
          🩺 Essayez une question vétérinaire :
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DEMO_QUESTIONS.map(q => (
            <button key={q.text} onClick={() => launch(q.text)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', border: '1px solid #DDD9CF', borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0B7A6A'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(11,122,106,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DDD9CF'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{q.emoji}</span>
              <span style={{ fontSize: 13, color: '#4A6460', flex: 1, lineHeight: 1.4 }}>{q.text}</span>
              <ArrowRight size={13} style={{ color: '#0B7A6A', flexShrink: 0, opacity: 0.6 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #DDD9CF', display: 'flex', gap: 8, alignItems: 'center', background: 'white' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') launch(input); }}
          placeholder="Ou posez votre propre question…"
          style={{ flex: 1, border: '1.5px solid #DDD9CF', borderRadius: 10, padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#111D1B', outline: 'none', background: '#F3F0EA', transition: 'border-color 0.15s' }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#0B7A6A'}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#DDD9CF'}
        />
        <button onClick={() => launch(input)} disabled={!input.trim()}
          style={{ width: 40, height: 40, background: input.trim() ? '#0B7A6A' : '#DDD9CF', border: 'none', borderRadius: 10, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s', boxShadow: input.trim() ? '0 4px 12px rgba(11,122,106,0.3)' : 'none' }}>
          <Send size={14} color="white" />
        </button>
      </div>

      <div style={{ padding: '6px 14px 10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }} />
        <span style={{ fontSize: 11, color: '#7A9490', fontFamily: "'DM Sans', sans-serif" }}>Aucun compte requis · 3 questions gratuites</span>
      </div>
    </div>
  );
}

/* ── Navbar ── */
function HeroHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: '8px auto 0', padding: '0 20px' }}>
        <div style={{ background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', border: scrolled ? '1px solid #DDD9CF' : '1px solid transparent', borderRadius: 14, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Logo height={32} />
            <span style={{ background: '#E8F2EF', color: '#085F52', borderRadius: 100, fontSize: 9, fontWeight: 700, padding: '2px 7px', letterSpacing: '0.05em' }}>BETA</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
            <a href="#fonctionnalites" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#4A6460', textDecoration: 'none' }}>Fonctionnalités</a>
            <a href="#comparatif" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#4A6460', textDecoration: 'none' }}>Comparatif</a>
            <Link href="/login" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#4A6460', textDecoration: 'none', padding: '6px 16px', border: '1.5px solid #DDD9CF', borderRadius: 8 }}>Se connecter</Link>
            <Link href="/login" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'white', textDecoration: 'none', padding: '7px 18px', background: '#0B7A6A', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 8px rgba(11,122,106,0.3)' }}>Essayer gratuitement <ArrowRight size={13} /></Link>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="show-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#111D1B"><path d="M3 5h14M3 10h14M3 15h14" stroke="#111D1B" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: 'white', border: '1px solid #DDD9CF', borderRadius: 14, padding: '14px 20px', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#4A6460', textDecoration: 'none' }}>Fonctionnalités</a>
            <a href="#comparatif" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#4A6460', textDecoration: 'none' }}>Comparatif</a>
            <Link href="/login" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'white', textDecoration: 'none', padding: '10px 16px', background: '#0B7A6A', borderRadius: 8, textAlign: 'center' }}>Essayer gratuitement</Link>
          </div>
        )}
      </div>
    </header>
  );
}

/* ── Hero Section ── */
export function HeroSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        .hidden-mobile { display: flex; }
        .show-mobile { display: none !important; }
        @media(max-width:768px){
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
      <HeroHeader />
      <main style={{ background: '#F3F0EA', paddingTop: 80 }}>

        {/* ── Hero ── */}
        <section style={{ padding: '72px 24px 56px', textAlign: 'center' }}>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E8F2EF', color: '#085F52', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 28, letterSpacing: '0.01em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0B7A6A', display: 'inline-block' }} />
              Assistant IA vétérinaire · Accès anticipé
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(38px, 5.5vw, 66px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#111D1B', marginBottom: 20 }}>
              L&apos;IA vétérinaire qui<br />
              vous fait gagner{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#0B7A6A' }}>2h par jour</em>
            </h1>

            {/* Subtitle */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, lineHeight: 1.75, color: '#7A9490', maxWidth: 520, margin: '0 auto 36px' }}>
              Comptes-rendus en 30 secondes, réceptionniste 24h/24 et dossiers automatiques — construit exclusivement pour les vétérinaires.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0B7A6A', color: 'white', textDecoration: 'none', padding: '17px 36px', borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, boxShadow: '0 4px 20px rgba(11,122,106,0.35)', letterSpacing: '-0.01em' }}>
                Commencer gratuitement <ArrowRight size={16} />
              </Link>
              <a href="#fonctionnalites" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#111D1B', textDecoration: 'none', padding: '17px 30px', borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 400, border: '1.5px solid #DDD9CF' }}>
                Voir les fonctionnalités
              </a>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#7A9490' }}>Accès gratuit pendant la bêta · Sans carte bancaire</p>
          </div>
        </section>

        {/* ── Live Demo Widget ── */}
        <section style={{ padding: '0 24px 72px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#0B7A6A', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }} />
                Essayez Vetaia maintenant — aucun compte requis
              </span>
            </div>
            <MiniChatDemo />
          </div>
        </section>

      </main>
    </>
  );
}
