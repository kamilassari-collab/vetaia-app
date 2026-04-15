'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Mic, CheckCircle2, Clock } from 'lucide-react';
import React from 'react';
import { Logo } from '@/components/Logo';

const CALENDLY_URL = 'https://calendly.com/kamilassari/30min';

// ─── Report Demo ──────────────────────────────────────────────────────────────
const REPORT_CONTENT = [
  {
    label: 'Anamnèse',
    lines: [
      'Kaya, Labrador Retriever, 4 ans, femelle non stérilisée.',
      'Anorexie depuis 48h. Vomissements bilieux 2×/jour.',
    ],
  },
  {
    label: 'Examen clinique',
    lines: [
      'Muqueuses légèrement pâles. Abdomen sensible à la palpation crâniale.',
      'T° 39.1°C · FC 98 bpm · FR 22/min · Déshydratation 5–8%.',
    ],
  },
  {
    label: 'Plan thérapeutique',
    lines: [
      'Fluidothérapie IV NaCl 0.9% — 35 ml/kg/h pendant 4h.',
      'Maropitant 1 mg/kg SC SID · Oméprazole 1 mg/kg PO BID.',
    ],
  },
];
const TOTAL_LINES = REPORT_CONTENT.reduce((s, c) => s + c.lines.length, 0);
const WAVE_H = [8, 20, 12, 26, 9, 22, 15, 30, 8, 24, 13, 28, 10, 19, 14, 25, 17, 9];

function ReportContent({ visibleLines }: { visibleLines: number }) {
  let lineCount = 0;
  return (
    <>
      {REPORT_CONTENT.map(({ label, lines }) => {
        const secStart = lineCount;
        lineCount += lines.length;
        const visible = Math.max(0, Math.min(visibleLines - secStart, lines.length));
        if (visible === 0) return null;
        return (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0B7A6A', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
            {lines.slice(0, visible).map((text, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                style={{ fontSize: 12.5, color: '#4A6460', lineHeight: 1.65, margin: '0 0 3px', fontFamily: "'DM Sans', sans-serif" }}>
                {text}
              </motion.p>
            ))}
          </div>
        );
      })}
    </>
  );
}

function ReportDemo() {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'generating' | 'done'>('idle');
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    function run() {
      timers.forEach(clearTimeout);
      timers.length = 0;
      setPhase('idle');
      setVisibleLines(0);
      timers.push(setTimeout(() => setPhase('recording'), 600));
      timers.push(setTimeout(() => setPhase('generating'), 2800));
      for (let i = 1; i <= TOTAL_LINES; i++) {
        timers.push(setTimeout(() => setVisibleLines(i), 2800 + i * 460));
      }
      timers.push(setTimeout(() => setPhase('done'), 2800 + TOTAL_LINES * 460 + 200));
    }

    run();
    const interval = setInterval(run, 15000);
    return () => { clearInterval(interval); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #DDD9CF', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(11,122,106,0.12)' }}>

      {/* Titlebar */}
      <div style={{ background: '#111D1B', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}>
          Vetaia — Compte-rendu consultation
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <AnimatePresence mode="wait">
            {phase === 'recording' && (
              <motion.span key="rec" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
                <motion.span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                EN COURS
              </motion.span>
            )}
            {phase === 'generating' && (
              <motion.span key="gen" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
                ✦ GÉNÉRATION IA
              </motion.span>
            )}
            {phase === 'done' && (
              <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 10, background: 'rgba(34,197,94,0.18)', color: '#22c55e', fontWeight: 700, padding: '2px 9px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif" }}>
                ✓ GÉNÉRÉ EN 18S
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Patient header */}
      <div style={{ padding: '13px 18px', borderBottom: '1px solid #DDD9CF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#0B7A6A,#1A4A43)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🐕</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111D1B', fontFamily: "'DM Sans', sans-serif" }}>Kaya · Labrador · 4 ans · Femelle</div>
          <div style={{ fontSize: 11, color: '#7A9490', fontFamily: "'DM Sans', sans-serif" }}>Dr. Moreau · 31 mars 2026</div>
        </div>
      </div>

      {/* Body — fixed height, single AnimatePresence, no layout shift */}
      <div style={{ height: 318, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">

          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#F3F0EA', border: '1.5px solid #DDD9CF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={18} color="#C4BDAD" />
              </div>
              <div style={{ fontSize: 12, color: '#B5AFA6', fontFamily: "'DM Sans', sans-serif" }}>Démo en préparation…</div>
            </motion.div>
          )}

          {phase === 'recording' && (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              <motion.div
                style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.18)', '0 0 0 14px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}>
                <Mic size={22} color="#ef4444" />
              </motion.div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
                {WAVE_H.map((h, i) => (
                  <motion.div key={i}
                    style={{ width: 3, borderRadius: 2, background: '#0B7A6A', originY: 1, height: h }}
                    animate={{ scaleY: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.055, ease: 'easeInOut' }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#7A9490', fontFamily: "'DM Sans', sans-serif" }}>Dictée vocale en cours…</div>
            </motion.div>
          )}

          {(phase === 'generating' || phase === 'done') && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, padding: '14px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <ReportContent visibleLines={visibleLines} />
              <AnimatePresence>
                {phase === 'done' && (
                  <motion.div key="cta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ padding: '9px 14px', background: '#0B7A6A', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexShrink: 0 }}>
                    <CheckCircle2 size={13} color="white" />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white', fontFamily: "'DM Sans', sans-serif" }}>Compte-rendu complet · Prêt à signer</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phone Demo ───────────────────────────────────────────────────────────────
const PHONE_MSGS = [
  { from: 'client', text: 'Bonjour, je voudrais un rdv pour mon chat, il mange plus depuis hier soir.' },
  { from: 'ai', text: "Bonjour ! Je suis l'assistant Vetaia. Quel est le prénom et l'âge de votre chat ?" },
  { from: 'client', text: "Il s'appelle Milo, 3 ans. Il est aussi un peu léthargique depuis ce matin." },
  { from: 'ai', text: "Merci. Je note : anorexie + léthargie chez Milo, 3 ans. Je vérifie les disponibilités du Dr. Vasseur..." },
];

function PhoneDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const allTimers: ReturnType<typeof setTimeout>[] = [];

    function run() {
      allTimers.forEach(clearTimeout);
      allTimers.length = 0;
      setVisibleCount(0);
      setTyping(false);
      setBooked(false);

      let delay = 600;
      PHONE_MSGS.forEach((_, i) => {
        allTimers.push(setTimeout(() => setTyping(true), delay));
        delay += 750;
        allTimers.push(setTimeout(() => { setTyping(false); setVisibleCount(i + 1); }, delay));
        delay += 700;
      });
      allTimers.push(setTimeout(() => setBooked(true), delay + 400));
    }

    run();
    const interval = setInterval(run, 14000);
    return () => { clearInterval(interval); allTimers.forEach(clearTimeout); };
  }, []);

  return (
    <div style={{ background: '#0D1A18', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 24px 64px rgba(0,0,0,0.35)' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.15)' }}>
        <motion.span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}
          animate={{ boxShadow: ['0 0 0 2px rgba(74,222,128,0.3)', '0 0 0 6px rgba(74,222,128,0)', '0 0 0 2px rgba(74,222,128,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>Appel entrant · Clinique du Parc</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: "'DM Sans', sans-serif" }}>02:14</span>
      </div>

      {/* Messages */}
      <div style={{ padding: '16px 16px', minHeight: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PHONE_MSGS.slice(0, visibleCount).map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28 }}
            style={{ display: 'flex', justifyContent: msg.from === 'client' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7 }}>
            {msg.from === 'ai' && (
              <div style={{ flexShrink: 0 }}><Logo mark height={22} dark /></div>
            )}
            <div style={{
              maxWidth: '78%', padding: '9px 13px', fontSize: 12.5, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif",
              borderRadius: msg.from === 'client' ? '12px 3px 12px 12px' : '3px 12px 12px 12px',
              background: msg.from === 'client' ? '#0B7A6A' : 'rgba(255,255,255,0.07)',
              color: msg.from === 'client' ? 'white' : 'rgba(255,255,255,0.8)',
            }}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div key="dots" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
              <div style={{ flexShrink: 0 }}><Logo mark height={22} dark /></div>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '3px 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#4DBFB0', display: 'inline-block' }}
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {booked && (
            <motion.div key="booked" initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }}
              style={{ background: 'rgba(11,122,106,0.12)', border: '1px solid rgba(11,122,106,0.22)', borderRadius: 11, padding: '13px 15px', marginTop: 2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4DBFB0', fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>✓ Rendez-vous confirmé automatiquement</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}>Demain 10h30 · Dr. Vasseur · Anorexie féline · Milo</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Dossier / Integration Demo ───────────────────────────────────────────────
// Transcript chunks — each chunk triggers a field on the right
const TRANSCRIPT_CHUNKS = [
  { text: 'T° 39,1°C, FC 98 bpm, FR 22/min.', field: 0 },
  { text: ' Poids 28,5 kg. Déshydratation 5–8%.', field: 1 },
  { text: ' Anorexie depuis 48h, vomissements bilieux 2×/jour.', field: 2 },
  { text: ' Maropitant 1 mg/kg SC SID, oméprazole 1 mg/kg PO BID.', field: 3 },
];

const FORM_FIELDS = [
  { label: 'Constantes vitales', value: 'T° 39,1°C · FC 98 bpm · FR 22/min' },
  { label: 'Poids / hydratation', value: '28,5 kg · Déshydraté 5–8%' },
  { label: 'Motif / anamnèse', value: 'Anorexie 48h · Vomissements bilieux' },
  { label: 'Traitement prescrit', value: 'Maropitant 1mg/kg SC · Oméprazole 1mg/kg' },
];

function TypedValue({ value, active }: { value: string; active: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const prevActive = React.useRef(false);

  useEffect(() => {
    if (!active) { setDisplayed(''); prevActive.current = false; return; }
    if (prevActive.current) return;
    prevActive.current = true;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(value.slice(0, i));
      if (i >= value.length) clearInterval(iv);
    }, 22);
    return () => clearInterval(iv);
  }, [active, value]);

  if (!active && !displayed) return <span style={{ color: '#C4BDAD' }}>—</span>;
  return <>{displayed}{active && displayed.length < value.length && <span style={{ opacity: 0.4 }}>|</span>}</>;
}

function DossierDemo() {
  // filledFields: bitmask of which fields have been populated
  const [transcriptLen, setTranscriptLen] = useState(0);
  const [filledFields, setFilledFields] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    function run() {
      timers.forEach(clearTimeout);
      timers.length = 0;
      setTranscriptLen(0);
      setFilledFields(new Set());
      setDone(false);

      let delay = 500;
      TRANSCRIPT_CHUNKS.forEach((chunk, i) => {
        // Each chunk: start typing after delay, then fill field 600ms later
        timers.push(setTimeout(() => setTranscriptLen(i + 1), delay));
        delay += 900;
        timers.push(setTimeout(() => setFilledFields(prev => new Set([...prev, chunk.field])), delay - 300));
      });
      timers.push(setTimeout(() => setDone(true), delay + 300));
    }

    run();
    const interval = setInterval(run, 14000);
    return () => { clearInterval(interval); timers.forEach(clearTimeout); };
  }, []);

  const transcriptText = TRANSCRIPT_CHUNKS.slice(0, transcriptLen).map(c => c.text).join('');

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #DDD9CF', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(11,122,106,0.10)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar — two apps side by side */}
      <div style={{ background: '#111D1B', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 0 }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block', marginRight: 4 }} />)}
        <span style={{ marginLeft: 8, fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>Vetaia</span>
        <span style={{ margin: '0 10px', color: 'rgba(255,255,255,0.12)', fontSize: 14 }}>│</span>
        <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>Vetup — Dossier patient</span>
        <AnimatePresence mode="wait">
          {done && (
            <motion.span key="done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(34,197,94,0.18)', color: '#22c55e', fontWeight: 700, padding: '2px 9px', borderRadius: 100 }}>
              ✓ SYNCHRONISÉ
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Patient strip */}
      <div style={{ background: '#F7F5F0', padding: '10px 16px', borderBottom: '1px solid #DDD9CF', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#0B7A6A,#1A4A43)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🐕</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#111D1B' }}>Kaya · Labrador · 4 ans · F</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#7A9490' }}>Dr. Moreau · 31 mars 2026</span>
      </div>

      {/* Split body */}
      <div className="dossier-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', minHeight: 260 }}>

        {/* LEFT — Vetaia transcript */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <motion.div
              style={{ width: 7, height: 7, borderRadius: '50%', background: transcriptLen < TRANSCRIPT_CHUNKS.length ? '#ef4444' : '#22c55e', flexShrink: 0 }}
              animate={transcriptLen < TRANSCRIPT_CHUNKS.length ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 0.8, repeat: transcriptLen < TRANSCRIPT_CHUNKS.length ? Infinity : 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#7A9490', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {transcriptLen < TRANSCRIPT_CHUNKS.length ? 'Dictée en cours' : 'Transcription complète'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#4A6460', lineHeight: 1.7, background: '#F7F5F0', borderRadius: 9, padding: '10px 12px', minHeight: 80, border: '1px solid #ECEAE4' }}>
            {transcriptText}
            {transcriptLen < TRANSCRIPT_CHUNKS.length && transcriptLen > 0 && (
              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
                style={{ display: 'inline-block', width: 1.5, height: 12, background: '#0B7A6A', marginLeft: 2, verticalAlign: 'middle' }} />
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: '#DDD9CF' }} />

        {/* RIGHT — Vetup form */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#7A9490', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Fiche consultation</span>
          {FORM_FIELDS.map((field, i) => {
            const filled = filledFields.has(i);
            return (
              <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < FORM_FIELDS.length - 1 ? '1px solid #ECEAE4' : 'none' }}>
                <div style={{ fontSize: 10, color: '#A8A29E', marginBottom: 3 }}>{field.label}</div>
                <div style={{
                  fontSize: 12, fontWeight: filled ? 600 : 400,
                  color: filled ? '#111D1B' : '#C4BDAD',
                  transition: 'color 0.2s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {filled && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                      <CheckCircle2 size={11} color="#0B7A6A" style={{ flexShrink: 0 }} />
                    </motion.span>
                  )}
                  <TypedValue value={field.value} active={filled} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Coming soon wrapper ───────────────────────────────────────────────────────
function ComingSoonWrapper({ children, dark = false, feature }: { children: React.ReactNode; dark?: boolean; feature?: string }) {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setFormState('loading');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, feature: feature ?? 'unknown' }),
      });
      if (res.ok) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }

  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
      {/* Blurred demo preview */}
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.55 }}>
        {children}
      </div>
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        background: dark
          ? 'linear-gradient(135deg, rgba(13,26,24,0.82), rgba(8,14,12,0.78))'
          : 'linear-gradient(135deg, rgba(243,240,234,0.82), rgba(255,255,255,0.78))',
        backdropFilter: 'blur(2px)',
        borderRadius: 20,
        border: dark ? '1px solid rgba(11,122,106,0.2)' : '1px solid rgba(11,122,106,0.15)',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: dark ? 'rgba(11,122,106,0.2)' : '#E8F2EF', border: `1px solid ${dark ? 'rgba(11,122,106,0.35)' : 'rgba(11,122,106,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Clock size={20} color="#0B7A6A" />
        </div>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 400, color: dark ? 'white' : '#111D1B', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Bientôt disponible
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: dark ? 'rgba(255,255,255,0.45)' : '#7A9490', lineHeight: 1.6, maxWidth: 240 }}>
          Cette fonctionnalité arrive prochainement.<br />Inscrivez-vous pour être notifié en premier.
        </div>

        {formState === 'success' ? (
          <div style={{ marginTop: 18, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#0B7A6A' }}>
            ✓ Vous serez notifié en avant-première !
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 260, padding: '0 16px', boxSizing: 'border-box' }}>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid #DDD9CF',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                background: dark ? 'rgba(255,255,255,0.07)' : 'white',
                color: dark ? 'rgba(255,255,255,0.85)' : '#111D1B',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={formState === 'loading'}
              style={{
                width: '100%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 20px', background: '#0B7A6A', color: 'white', borderRadius: 9,
                fontSize: 13, fontWeight: 500, border: 'none', cursor: formState === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 14px rgba(11,122,106,0.3)',
                opacity: formState === 'loading' ? 0.7 : 1,
              }}>
              {formState === 'loading' ? '...' : <>M&apos;avertir en premier <ArrowRight size={13} /></>}
            </button>
            {formState === 'error' && (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#ef4444' }}>
                Erreur, réessayez
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Feature section wrapper ──────────────────────────────────────────────────
function FeatureSection({ n, badge, title, desc, cta, demo, reverse = false, dark = false, comingSoon = false, notifyFeature }: {
  n: string; badge: string; title: React.ReactNode; desc: string; cta: string; demo: React.ReactNode; reverse?: boolean; dark?: boolean; comingSoon?: boolean; notifyFeature?: string;
}) {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setFormState('loading');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, feature: notifyFeature ?? 'unknown' }),
      });
      setFormState(res.ok ? 'success' : 'error');
    } catch {
      setFormState('error');
    }
  }

  const textContent = (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.22)' : '#C4BDAD', letterSpacing: '0.1em' }}>{n}</span>
        <span style={{ height: 1, width: 28, background: dark ? 'rgba(255,255,255,0.12)' : '#DDD9CF', display: 'inline-block' }} />
        <span style={{ background: dark ? 'rgba(11,122,106,0.22)' : '#E8F2EF', color: dark ? '#4DBFB0' : '#085F52', borderRadius: 100, fontSize: 10, fontWeight: 700, padding: '3px 10px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>{badge}</span>
        {comingSoon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(251,191,36,0.12)', color: '#d97706', borderRadius: 100, fontSize: 10, fontWeight: 700, padding: '3px 10px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(251,191,36,0.2)' }}>
            <Clock size={9} /> Bientôt disponible
          </span>
        )}
      </div>
      <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(32px, 3.8vw, 52px)', fontWeight: 400, color: dark ? 'white' : '#111D1B', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
        {title}
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: dark ? 'rgba(255,255,255,0.48)' : '#7A9490', lineHeight: 1.8, marginBottom: 28, maxWidth: 420 }}>
        {desc}
      </p>

      {notifyFeature ? (
        formState === 'success' ? (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: dark ? '#4DBFB0' : '#0B7A6A', padding: '12px 0' }}>
            ✓ Vous serez notifié en avant-première !
          </div>
        ) : (
          <form onSubmit={handleNotify} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                border: dark ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid #DDD9CF',
                borderRadius: 9,
                padding: '12px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                background: dark ? 'rgba(255,255,255,0.07)' : 'white',
                color: dark ? 'rgba(255,255,255,0.85)' : '#111D1B',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={formState === 'loading'}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 24px',
                background: dark ? 'rgba(11,122,106,0.22)' : '#0B7A6A',
                color: dark ? '#4DBFB0' : 'white',
                borderRadius: 10, fontSize: 14, fontWeight: 500, border: dark ? '1px solid rgba(11,122,106,0.4)' : 'none',
                cursor: formState === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: dark ? 'none' : '0 4px 18px rgba(11,122,106,0.28)',
                opacity: formState === 'loading' ? 0.7 : 1,
              }}>
              {formState === 'loading' ? '...' : <>M&apos;avertir en premier <ArrowRight size={14} /></>}
            </button>
            {formState === 'error' && (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#ef4444' }}>Erreur, réessayez</div>
            )}
          </form>
        )
      ) : (
        <Link href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          background: dark ? 'rgba(11,122,106,0.18)' : '#0B7A6A',
          color: dark ? '#4DBFB0' : 'white',
          padding: '13px 26px', borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 500,
          border: dark ? '1px solid rgba(11,122,106,0.35)' : 'none',
          boxShadow: dark ? 'none' : '0 4px 18px rgba(11,122,106,0.28)',
        }}>
          {cta} <ArrowRight size={14} />
        </Link>
      )}
    </motion.div>
  );

  const demoContent = (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
      {demo}
    </motion.div>
  );

  return (
    <section className="feat-section" style={{ padding: '100px 24px', background: dark ? '#111D1B' : 'white', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#DDD9CF'}` }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
        className="feat-grid">
        {reverse ? <>{demoContent}{textContent}</> : <>{textContent}{demoContent}</>}
      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function FeaturesShowcase() {
  return (
    <div id="fonctionnalites">
      <style>{`
        @media (max-width: 860px) {
          .feat-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feat-grid > *:first-child { order: 2; }
          .feat-grid > *:last-child { order: 1; }
        }
        @media (max-width: 560px) {
          .dossier-split { grid-template-columns: 1fr !important; }
          .dossier-split > div:nth-child(2) { display: none; }
          .feat-section { padding-top: 56px !important; padding-bottom: 56px !important; }
          .feat-header { padding-top: 56px !important; padding-bottom: 48px !important; }
        }
      `}</style>

      {/* Section header */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="feat-header" style={{ padding: '88px 24px 72px', background: '#F3F0EA', textAlign: 'center', borderTop: '1px solid #DDD9CF' }}>
        <span style={{ background: '#E8F2EF', color: '#085F52', borderRadius: 100, fontSize: 11, fontWeight: 700, padding: '4px 14px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>Fonctionnalités</span>
        <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 400, color: '#111D1B', letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 18, marginBottom: 14 }}>
          Tout ce dont votre clinique{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#0B7A6A' }}>a besoin.</em>
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#7A9490', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
          Des outils IA construits spécifiquement pour la pratique vétérinaire — pas des solutions génériques adaptées à la hâte.
        </p>
      </motion.div>

      <FeatureSection
        n="01" badge="Copilote clinique IA"
        title={<>Votre second avis.<br />Votre compte-rendu.<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: '#0B7A6A' }}>En 30 secondes.</em></>}
        desc="Dictez vos observations pour générer un compte-rendu SOAP complet — ou posez une question clinique complexe et obtenez une réponse précise avec dosages, protocoles et diagnostics différentiels. Conçu pour les vétérinaires, pas pour le grand public."
        cta="Essayer gratuitement"
        demo={<ReportDemo />}
      />

      <FeatureSection
        n="02" badge="Réceptionniste IA"
        title={<>Plus d&apos;appels manqués,<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: '#4DBFB0' }}>jamais.</em></>}
        desc="Pendant vos consultations, Vetaia décroche, qualifie l'urgence, collecte les informations patient et confirme le rendez-vous — sans intervention humaine, en français naturel, 24h/24."
        cta="Voir une démo"
        demo={<PhoneDemo />}
        reverse dark comingSoon notifyFeature="Réceptionniste IA"
      />

      <FeatureSection
        n="03" badge="Dossiers patients"
        title={<>Dossiers patients<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: '#0B7A6A' }}>mis à jour automatiquement</em></>}
        desc="Après chaque consultation, Vetaia met à jour le dossier et l'exporte automatiquement dans votre logiciel — vaccins, ordonnances, constantes, compte-rendu. Compatible avec Vetup, VetManager, Vet-Instant, Intravet et plus."
        cta="Découvrir les intégrations"
        demo={<DossierDemo />}
        comingSoon notifyFeature="Dossiers patients"
      />
    </div>
  );
}
