'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionWithMockup from '@/components/blocks/section-with-mockup';
import { Logo } from '@/components/Logo';

const sections = [
    {
        title: (
            <>
                Posez n'importe quelle
                <br />
                question vétérinaire.
            </>
        ),
        description: (
            <>
                Dosages, protocoles anesthésiques, diagnostics différentiels, suivi post-op —
                VetaIA répond en quelques secondes, avec les sources et références bibliographiques
                pour chaque réponse. Entraîné sur 500 000+ cas cliniques annotés, validés par
                un comité scientifique vétérinaire.
            </>
        ),
        primaryImageSrc: '/ui-demo-primary.png',
        secondaryImageSrc: '/ui-demo-secondary.png',
        reverseLayout: false,
    },
    {
        title: (
            <>
                Des réponses sourcées,
                <br />
                pas des suppositions.
            </>
        ),
        description: (
            <>
                Chaque réponse affiche ses sources : réglementation française, guidelines
                internationales, cas cliniques annotés. Vous savez exactement d'où vient
                l'information et vous pouvez la vérifier en un clic.
            </>
        ),
        primaryImageSrc: '/ui-demo-secondary.png',
        secondaryImageSrc: '/ui-demo-primary.png',
        reverseLayout: true,
    },
];

export default function AssistantPage() {
    return (
        <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,300;0,400;1,300;1,400&display=swap');
                * { box-sizing: border-box; }
            `}</style>

            {/* Nav */}
            <nav style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <Logo height={28} dark />
                </Link>
                <Link href="/demo" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 20px', background: '#0B7A6A', color: 'white',
                    borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(11,122,106,0.35)'
                }}>
                    Essayer gratuitement <ArrowRight size={13} />
                </Link>
            </nav>

            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 680, margin: '0 auto' }}>
                <span style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    color: '#4DBFB0', background: 'rgba(11,122,106,0.15)', border: '1px solid rgba(11,122,106,0.3)',
                    borderRadius: 99, padding: '4px 12px', marginBottom: 20, textTransform: 'uppercase'
                }}>
                    Assistant IA vétérinaire
                </span>
                <h1 style={{
                    fontFamily: "'Newsreader', serif", fontSize: 'clamp(36px, 5vw, 56px)',
                    fontWeight: 400, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em',
                    marginBottom: 20
                }}>
                    L'assistant clinique qui connaît la médecine vétérinaire.
                </h1>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 36 }}>
                    Posez vos questions en langage naturel. Obtenez des réponses précises,
                    sourcées, adaptées à la pratique vétérinaire française.
                </p>
                <Link href="/demo" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 32px', background: '#0B7A6A', color: 'white',
                    borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 6px 24px rgba(11,122,106,0.4)'
                }}>
                    Tester l'assistant — 3 questions gratuites <ArrowRight size={15} />
                </Link>
            </div>

            {/* Feature sections */}
            {sections.map((s, i) => (
                <SectionWithMockup key={i} {...s} />
            ))}

            {/* CTA bottom */}
            <div style={{ textAlign: 'center', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 36, fontWeight: 400, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>
                    Prêt à gagner du temps ?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>
                    Accès gratuit pendant la bêta — sans carte bancaire.
                </p>
                <Link href="/signup" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 32px', background: '#0B7A6A', color: 'white',
                    borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 6px 24px rgba(11,122,106,0.4)'
                }}>
                    Créer mon compte gratuit <ArrowRight size={15} />
                </Link>
            </div>
        </div>
    );
}
