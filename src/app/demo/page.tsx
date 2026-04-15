'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Logo } from '@/components/Logo';

// ─── Config ──────────────────────────────────────────────────────────────────
const DEMO_LIMIT = 3;
const CALENDLY_URL = 'https://calendly.com/kamilassari/30min';

const SUGGESTED = [
  { emoji: '💊', text: 'Dosage amoxicilline pour un chat de 4 kg ?' },
  { emoji: '🫀', text: 'Signes cliniques insuffisance rénale féline' },
  { emoji: '🔬', text: 'Soins post-op après splénectomie chien' },
  { emoji: '🐰', text: 'Protocole anesthésie pour un lapin' },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Source { name: string; url: string; type: string; excerpt: string }
interface Msg { role: 'user' | 'assistant'; content: string; sources?: Source[] }

// ─── Typing dots ─────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.span key={i}
          style={{ width: 5, height: 5, borderRadius: '50%', background: '#4DBFB0', display: 'inline-block' }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ─── Source pills ─────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  'Réglementation FR': '#C1121F',
  'Cas cliniques FR': '#E07A1F',
  'Guideline International': '#185FA5',
  'Reference': '#0B7A6A',
  'Guideline': '#185FA5',
  'Interne': '#7A9490',
};

function SourcePills({ sources }: { sources: Source[] }) {
  return (
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {sources.map((s, i) => {
        const color = TYPE_COLORS[s.type] ?? '#7A9490';
        const pill = (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 99,
            background: `${color}18`, border: `1px solid ${color}40`,
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
            color: 'rgba(255,255,255,0.6)', cursor: s.url ? 'pointer' : 'default',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {s.name}
          </span>
        );
        return s.url
          ? <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{pill}</a>
          : pill;
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLimited = count >= DEMO_LIMIT;

  // Pick up prefill from landing page widget
  useEffect(() => {
    const q = sessionStorage.getItem('demo-prefill');
    if (q) { sessionStorage.removeItem('demo-prefill'); send(q); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading || isLimited) return;
    setInput('');
    setCount(c => c + 1);
    setMessages(m => [...m, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: body.message ?? 'Une erreur est survenue.' } : msg));
        setLoading(false);
        return;
      }

      const sources: Source[] = JSON.parse(res.headers.get('X-Sources') || '[]');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const t = full;
        setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: t } : msg));
      }

      setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: full, sources } : msg));
    } catch {
      setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: 'Erreur réseau — réessayez.' } : msg));
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const remaining = DEMO_LIMIT - count;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0D1A18', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .demo-prose { font-size: 14px; line-height: 1.75; color: rgba(255,255,255,0.82); }
        .demo-prose p { margin: 0 0 10px; }
        .demo-prose p:last-child { margin-bottom: 0; }
        .demo-prose ul, .demo-prose ol { margin: 6px 0 10px 18px; }
        .demo-prose li { margin-bottom: 3px; }
        .demo-prose strong { color: white; font-weight: 600; }
        .demo-prose code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-size: 12.5px; }
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          .demo-suggest-grid { grid-template-columns: 1fr !important; max-width: 100% !important; }
          .demo-topbar-badge { display: none !important; }
          .demo-empty-pad { padding-top: 16px !important; }
          .demo-msg-user { max-width: 90% !important; }
          .demo-msg-ai { max-width: 98% !important; }
          .demo-limit-btns { flex-direction: column !important; align-items: stretch !important; }
          .demo-limit-btns a { justify-content: center !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ flexShrink: 0, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.2)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          <ArrowLeft size={13} /> Retour
        </Link>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo height={24} dark />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>— Démo</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isLimited && (
            <span className="demo-topbar-badge" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.08)' }}>
              {remaining} question{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
            </span>
          )}
          <Link href="/login" style={{ fontSize: 12, fontWeight: 500, color: '#4DBFB0', textDecoration: 'none', padding: '5px 12px', border: '1px solid rgba(11,122,106,0.35)', borderRadius: 7, background: 'rgba(11,122,106,0.1)' }}>
            Accès complet →
          </Link>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760, width: '100%', margin: '0 auto', alignSelf: 'center' }}>

        {/* Empty state — suggested questions */}
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="demo-empty-pad" style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ margin: '0 auto 20px', display: 'flex', justifyContent: 'center' }}>
              <Logo mark height={52} dark />
            </div>
            <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 400, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Posez une question vétérinaire
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 28, lineHeight: 1.6 }}>
              {DEMO_LIMIT} questions gratuites · Aucun compte requis
            </p>
            <div className="demo-suggest-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 540, margin: '0 auto', textAlign: 'left' }}>
              {SUGGESTED.map(q => (
                <button key={q.text} onClick={() => send(q.text)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', textAlign: 'left' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(11,122,106,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,122,106,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{q.emoji}</span>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>{q.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Conversation */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'user' ? (
                <div className="demo-msg-user" style={{ maxWidth: '75%', padding: '11px 16px', background: '#0B7A6A', color: 'white', borderRadius: '16px 4px 16px 16px', fontSize: 14, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                  {msg.content}
                </div>
              ) : (
                <div className="demo-msg-ai" style={{ maxWidth: '85%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Logo mark height={18} dark />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#4DBFB0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Vetaia</span>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px' }}>
                    {msg.content
                      ? <div className="demo-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                      : (loading && i === messages.length - 1 ? <TypingDots /> : null)
                    }
                  </div>
                  {msg.sources && msg.sources.length > 0 && <SourcePills sources={msg.sources} />}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input area or limit wall */}
      <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {isLimited ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                Vous avez utilisé vos {DEMO_LIMIT} questions de démo
              </p>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginBottom: 14, lineHeight: 1.6 }}>
                Accédez à la version complète — questions illimitées, dossiers patients, rapports SOAP.
              </p>
              <div className="demo-limit-btns" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: '#0B7A6A', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(11,122,106,0.35)' }}>
                  Accéder à la démo complète <ArrowRight size={13} />
                </Link>
                <a href={CALENDLY_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Réserver un appel
                </a>
              </div>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Posez votre question vétérinaire…"
                disabled={loading}
                rows={1}
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'white', outline: 'none', resize: 'none', lineHeight: 1.5, transition: 'border-color 0.15s' }}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(11,122,106,0.6)'}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || loading}
                style={{ width: 42, height: 42, background: input.trim() && !loading ? '#0B7A6A' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 11, cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', boxShadow: input.trim() && !loading ? '0 4px 14px rgba(11,122,106,0.35)' : 'none' }}>
                <Send size={15} color={input.trim() && !loading ? 'white' : 'rgba(255,255,255,0.25)'} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
