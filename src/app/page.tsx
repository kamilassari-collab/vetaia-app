import Link from "next/link";
import { HeroSection } from "@/components/blocks/hero-section-1";
import { FeaturesShowcase } from "@/components/blocks/features-showcase";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/blocks/footer";

/* ─── Stats banner ───────────────────────────────────── */
function StatsBanner() {
  const stats = [
    { value: "30s", label: "pour générer un rapport complet" },
    { value: "2h", label: "gagnées par vétérinaire par jour" },
    { value: "24/7", label: "disponibilité pour vos clients" },
    { value: "100%", label: "données vétérinaires certifiées" },
  ];
  return (
    <div style={{ background: "#111D1B", padding: "20px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
        {stats.map(({ value, label }) => (
          <div key={value} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 32, fontWeight: 300, color: "#0D9C87", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontWeight: 400 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Comparison ─────────────────────────────────────── */
function Comparison() {
  const rows: { feature: string; note?: string; leash: boolean; partial?: boolean; generic?: boolean; none?: boolean }[] = [
    { feature: "Rédaction de compte-rendu", note: "ChatGPT peut le faire — mais sans protocoles vétérinaires ni dosages validés", leash: true, partial: true, none: false },
    { feature: "Réponses aux questions cliniques", note: "ChatGPT répond, mais sans données vétérinaires certifiées ni mises à jour", leash: true, partial: true, none: false },
    { feature: "Dosages validés par espèce, race et poids", leash: true, none: false },
    { feature: "Réceptionniste IA 24h/24 — sans configuration", leash: true, none: false },
    { feature: "Intégration logiciels vétérinaires (Vetup, VetManager, Provet…)", leash: true, none: false },
    { feature: "Données hébergées en Europe · Conforme RGPD", leash: true, none: true },
    { feature: "Entraîné sur des protocoles cliniques vétérinaires réels", leash: true, none: false },
  ];

  const Check = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#0B7A6A" fillOpacity="0.12"/>
      <path d="M5 9l3 3 5-5" stroke="#0B7A6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const Cross = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#F3F0EA"/>
      <path d="M6 6l6 6M12 6l-6 6" stroke="#DDD9CF" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
  const Partial = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#FAE5D5"/>
      <path d="M5.5 9h7" stroke="#B06030" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <section id="comparatif" style={{ padding: "96px 0", background: "#F3F0EA" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ background: "#E8F2EF", color: "#085F52", borderRadius: 100, fontSize: 11, fontWeight: 700, padding: "4px 14px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Comparatif</span>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 400, color: "#111D1B", letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 16, marginBottom: 12 }}>
            Pourquoi Leash AI et pas{" "}
            <em style={{ fontStyle: "italic", fontWeight: 300, color: "#0B7A6A" }}>une IA généraliste ?</em>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#7A9490", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            ChatGPT peut rédiger un rapport — mais sans connaître les dosages par espèce, les protocoles cliniques ni vos logiciels vétérinaires. Leash AI a été conçu pour ça.
          </p>
        </div>

        {/* Table */}
        <div style={{
          background: "white", borderRadius: 20, border: "1px solid #DDD9CF",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.07), 0 28px 72px rgba(11,122,106,0.10)",
        }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 160px", borderBottom: "1px solid #DDD9CF" }}>
            <div style={{ padding: "20px 24px" }} />
            <div style={{
              padding: "20px 0", textAlign: "center",
              background: "linear-gradient(180deg, #E8F2EF 0%, #F3F0EA 100%)",
              borderLeft: "1px solid #DDD9CF",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 4 }}>
                <Logo height={22} />
              </div>
              <span style={{ background: "#0B7A6A", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: "0.05em" }}>VÉTÉRINAIRE</span>
            </div>
            <div style={{ padding: "20px 0", textAlign: "center", borderLeft: "1px solid #DDD9CF" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#4A6460", marginBottom: 4 }}>IA Généraliste</div>
              <div style={{ fontSize: 11, color: "#7A9490" }}>ChatGPT, Gemini, Copilot…</div>
            </div>
            <div style={{ padding: "20px 0", textAlign: "center", borderLeft: "1px solid #DDD9CF" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#4A6460", marginBottom: 4 }}>Sans IA</div>
              <div style={{ fontSize: 11, color: "#7A9490" }}>Méthode actuelle</div>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 160px", borderBottom: i < rows.length - 1 ? "1px solid #DDD9CF" : "none" }}>
              <div style={{ padding: "16px 24px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#111D1B", fontWeight: 500 }}>{row.feature}</div>
                {row.note && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "#B06030", marginTop: 3, lineHeight: 1.45, maxWidth: 380 }}>
                    ↳ {row.note}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #DDD9CF", background: "rgba(11,122,106,0.02)" }}>
                {row.leash ? <Check /> : <Cross />}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #DDD9CF" }}>
                {row.partial ? <Partial /> : row.generic ? <Check /> : <Cross />}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #DDD9CF" }}>
                {row.none ? <Check /> : <Cross />}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16, paddingLeft: 4, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#FAE5D5"/><path d="M5.5 9h7" stroke="#B06030" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "#B06030" }}>Partiellement — faisable mais sans validation clinique vétérinaire</span>
          </div>
        </div>

        {/* CTA below table */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#0B7A6A", color: "white", textDecoration: "none",
            padding: "14px 32px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 500,
            boxShadow: "0 4px 18px rgba(11,122,106,0.35)",
          }}>
            Essayer Leash AI gratuitement →
          </Link>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#7A9490", marginTop: 12 }}>
            Pas de carte bancaire requise · Accès immédiat
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ padding: "96px 0", background: "#111D1B" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
        <span style={{ background: "rgba(11,122,106,0.25)", color: "#4DBFB0", borderRadius: 100, fontSize: 11, fontWeight: 700, padding: "4px 14px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Accès anticipé</span>
        <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 20, marginBottom: 16 }}>
          Prêt à gagner 2 heures{" "}
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "#4DBFB0" }}>par jour ?</em>
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
          Rejoignez les premières cliniques à tester Leash AI. Accès gratuit pendant la bêta.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#0B7A6A", color: "white", textDecoration: "none",
            padding: "14px 32px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 500,
            boxShadow: "0 4px 18px rgba(11,122,106,0.4)",
          }}>
            Commencer maintenant →
          </Link>
          <a href="#comparatif" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "transparent", color: "rgba(255,255,255,0.6)", textDecoration: "none",
            padding: "14px 32px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 400,
            border: "1.5px solid rgba(255,255,255,0.15)",
          }}>
            Voir le comparatif
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsBanner />
      <FeaturesShowcase />
      <Comparison />
      <FinalCTA />
      <Footer />
    </main>
  );
}
