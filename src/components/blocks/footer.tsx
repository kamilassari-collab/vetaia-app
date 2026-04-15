'use client';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer style={{ background: '#0A100E', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <style>{`
        .footer-link { font-family:'DM Sans',sans-serif; font-size:13px; color:rgba(255,255,255,0.35); text-decoration:none; transition:color 0.15s; display:block; }
        .footer-link:hover { color:rgba(255,255,255,0.75); }
      `}</style>

      {/* Main grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 40px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>

        {/* Brand */}
        <div>
          <Logo height={26} dark />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.22)', lineHeight: 1.75, marginTop: 16, maxWidth: 240 }}>
            Assistant clinique IA conçu exclusivement pour les vétérinaires diplômés. Données hébergées en Europe.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(11,122,106,0.1)', border: '1px solid rgba(11,122,106,0.2)', fontFamily: "'DM Sans',sans-serif", fontSize: 10.5, fontWeight: 600, color: '#4DBFB0', letterSpacing: '0.04em' }}>
              🇪🇺 RGPD conforme
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'DM Sans',sans-serif", fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
              🔒 Données UE
            </span>
          </div>
        </div>

        {/* Produit */}
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 16 }}>Produit</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="#fonctionnalites" className="footer-link">Fonctionnalités</a>
            <a href="#comparatif" className="footer-link">Comparatif</a>
            <Link href="/login" className="footer-link">Accès anticipé</Link>
            <a href="https://calendly.com/kamilassari/30min" target="_blank" rel="noreferrer" className="footer-link">Réserver une démo</a>
          </div>
        </div>

        {/* Conformité */}
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 16 }}>Conformité</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="#" className="footer-link">Mentions légales</a>
            <a href="#" className="footer-link">Politique de confidentialité</a>
            <a href="#" className="footer-link">Conditions d&apos;utilisation</a>
            <a href="#" className="footer-link">Politique cookies</a>
          </div>
        </div>

        {/* Avertissement réglementaire */}
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 16 }}>Avertissement</div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.75 }}>
            Vetaia est un outil d&apos;aide à la décision destiné <strong style={{ color: 'rgba(255,255,255,0.45)' }}>exclusivement aux vétérinaires diplômés</strong>. Il ne remplace pas le jugement clinique professionnel.
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11.5, color: 'rgba(255,255,255,0.14)', lineHeight: 1.75, marginTop: 10 }}>
            Conforme au cadre de l&apos;Ordre National des Vétérinaires (ONV) et aux directives ANSES sur les outils d&apos;aide à la prescription.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Vetaia — Tous droits réservés
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.1)', maxWidth: 520, textAlign: 'right', lineHeight: 1.6 }}>
            Outil réservé aux professionnels de santé animale · Les informations fournies ne constituent pas un avis médical opposable · Usage professionnel uniquement
          </p>
        </div>
      </div>
    </footer>
  );
}
