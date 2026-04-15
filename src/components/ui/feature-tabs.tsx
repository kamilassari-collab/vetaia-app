"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { FileText, Phone, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ── UI Mockups ─────────────────────────────────────── */

function ReportMockup() {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4EEEc", boxShadow: "0 8px 32px rgba(11,122,106,0.10), 0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden", width: "100%" }}>
      {/* Titlebar */}
      <div style={{ background: "#1A2E2B", padding: "12px 16px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840", display: "inline-block" }} />
        <span style={{ marginLeft: 10, fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>VetaIA — Compte-rendu</span>
      </div>
      <div style={{ padding: 20 }}>
        {/* Patient */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F3F8F7", borderRadius: 10, marginBottom: 16, border: "1px solid #E4EEEc" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#0B7A6A,#1A4A43)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🐕</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2E2B" }}>Kaya · Labrador Retriever</div>
            <div style={{ fontSize: 11, color: "#6B8A88", marginTop: 2 }}>4 ans · Femelle · Dr. Moreau</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#ECFDF5", color: "#059669", padding: "3px 9px", borderRadius: 100 }}>Généré en 18s</div>
        </div>
        {/* Sections */}
        {[
          { label: "Anamnèse", widths: [85, 70] },
          { label: "Examen clinique", widths: [90, 60, 75] },
          { label: "Plan thérapeutique", widths: [80, 55] },
        ].map(({ label, widths }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0B7A6A", marginBottom: 6 }}>{label}</div>
            {widths.map((w, i) => (
              <div key={i} style={{ height: 8, background: "#E4EEEc", borderRadius: 4, marginBottom: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${w}%`, background: "linear-gradient(90deg,#1A2E2B,#2D6A61)", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ))}
        <button style={{ width: "100%", padding: "10px", background: "#0B7A6A", color: "white", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 4 }}>
          ✓ Génération terminée · Prêt à signer
        </button>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div style={{ background: "#162926", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", overflow: "hidden", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#4ADE80", display: "inline-block", boxShadow: "0 0 0 3px rgba(74,222,128,0.2)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Appel entrant · Clinique du Parc</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>02:14</span>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: -4 }}>Client</div>
        <div style={{ background: "#0B7A6A", color: "white", borderRadius: "12px 4px 12px 12px", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.55, alignSelf: "flex-end", maxWidth: "85%" }}>
          Bonjour, je voudrais un rdv pour mon chat, il mange plus depuis hier
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: -4 }}>VetaIA</div>
        <div style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.82)", borderRadius: "4px 12px 12px 12px", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.55, maxWidth: "85%" }}>
          Bien sûr. Quel est le prénom et l&apos;âge de votre chat ? A-t-il d&apos;autres symptômes ?
        </div>
        <div style={{ background: "#0B7A6A", color: "white", borderRadius: "12px 4px 12px 12px", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.55, alignSelf: "flex-end", maxWidth: "85%" }}>
          Il s&apos;appelle Milo, 3 ans. Oui, un peu léthargique
        </div>
        <div style={{ background: "rgba(11,156,135,0.12)", border: "1px solid rgba(11,156,135,0.2)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4DBFB0", marginBottom: 3 }}>✓ Rendez-vous confirmé</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Demain 10h30 · Dr. Vasseur · Anorexie féline</div>
        </div>
      </div>
    </div>
  );
}

function RecordMockup() {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4EEEc", boxShadow: "0 8px 32px rgba(11,122,106,0.10), 0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden", width: "100%" }}>
      <div style={{ background: "#1A2E2B", padding: "12px 16px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840", display: "inline-block" }} />
        <span style={{ marginLeft: 10, fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Dossier patient · Milo</span>
      </div>
      <div style={{ padding: 0 }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #E4EEEc" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#0B7A6A,#1A4A43)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🐱</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2E2B" }}>Milo · Chat européen</div>
            <div style={{ fontSize: 11, color: "#6B8A88" }}>3 ans · Mâle castré · M. Dupont</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#ECFDF5", color: "#059669", padding: "3px 9px", borderRadius: 100 }}>Actif</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0B7A6A", padding: "12px 16px 4px" }}>Informations médicales</div>
        {[
          { label: "Poids", value: "4,2 kg", badge: "−0.3 kg", badgeStyle: { background: "#FEF3C7", color: "#D97706" } },
          { label: "Vaccins", value: "Typhus · Coryza", badge: "À jour", badgeStyle: { background: "#ECFDF5", color: "#059669" } },
          { label: "Antiparasitaires", value: "Stronghold — mars 2026", badge: "OK", badgeStyle: { background: "#ECFDF5", color: "#059669" } },
        ].map(({ label, value, badge, badgeStyle }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #E4EEEc" }}>
            <div>
              <div style={{ fontSize: 11, color: "#6B8A88" }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2E2B" }}>{value}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, ...badgeStyle }}>{badge}</span>
          </div>
        ))}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0B7A6A", padding: "12px 16px 4px" }}>Historique récent</div>
        {[
          { text: "Anorexie · Vomissements", date: "17 mars 2026 · Dr. Vasseur", active: true },
          { text: "Vaccination annuelle", date: "02 jan. 2026 · Dr. Moreau", active: false },
        ].map(({ text, date, active }) => (
          <div key={text} style={{ display: "flex", gap: 12, padding: "8px 16px", alignItems: "flex-start" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "#0B7A6A" : "#E4EEEc", flexShrink: 0, marginTop: 4 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#1A2E2B" }}>{text}</div>
              <div style={{ fontSize: 10, color: "#6B8A88", marginTop: 1 }}>{date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tabs data ──────────────────────────────────────── */

const tabs = [
  {
    value: "rapports",
    icon: <FileText className="h-4 w-4 shrink-0" />,
    label: "Rapports automatiques",
    badge: "IA Clinique",
    title: "Compte-rendu rédigé en 30 secondes.",
    description: "Dictez ou tapez vos observations — VetaIA génère un compte-rendu complet avec anamnèse, examen clinique et plan thérapeutique en terminologie vétérinaire certifiée.",
    buttonText: "Réserver une démo",
    preview: <ReportMockup />,
  },
  {
    value: "rdv",
    icon: <Phone className="h-4 w-4 shrink-0" />,
    label: "Prise de RDV IA",
    badge: "Réceptionniste 24/7",
    title: "Votre réceptionniste disponible la nuit.",
    description: "VetaIA décroche, comprend la demande, pose les bonnes questions et confirme le rendez-vous sans intervention humaine. En français naturel, 24h/24.",
    buttonText: "Voir comment ça marche",
    preview: <PhoneMockup />,
  },
  {
    value: "dossiers",
    icon: <FolderOpen className="h-4 w-4 shrink-0" />,
    label: "Dossiers patients",
    badge: "Gestion automatique",
    title: "Dossiers mis à jour après chaque consultation.",
    description: "Vaccinations, ordonnances, historique et suivis sont organisés automatiquement après chaque consultation. Cherchable et synchronisé avec SIRV et Véto+.",
    buttonText: "Découvrir les intégrations",
    preview: <RecordMockup />,
  },
];

/* ── Component ──────────────────────────────────────── */

export function FeatureTabs() {
  return (
    <section style={{ padding: "96px 0", background: "#F3F0EA" }}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-10">
          <Badge
            variant="outline"
            style={{ borderColor: "rgba(11,122,106,0.2)", color: "#0B7A6A", background: "rgba(11,122,106,0.06)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Fonctionnalités
          </Badge>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, letterSpacing: "-0.025em", color: "#1A2E2B", lineHeight: 1.1, maxWidth: 600 }}>
            Tout ce dont votre clinique{" "}
            <span style={{ fontStyle: "normal", fontWeight: 800, color: "#0B7A6A", fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.03em" }}>a besoin.</span>
          </h2>
          <p style={{ color: "#6B8A88", fontSize: 16, lineHeight: 1.7, maxWidth: 500 }}>
            Des outils IA construits spécifiquement pour la pratique vétérinaire — pas des solutions génériques adaptées à la hâte.
          </p>
        </div>

        <Tabs defaultValue="rapports">
          {/* Tab triggers */}
          <TabsList className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{
                  color: "#6B8A88",
                  background: "transparent",
                  border: "1.5px solid transparent",
                }}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
          <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #E4EEEc", padding: "40px 48px", boxShadow: "0 4px 24px rgba(11,122,106,0.06)" }}>
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
              >
                {/* Text */}
                <div className="flex flex-col gap-5">
                  <Badge
                    variant="outline"
                    style={{ width: "fit-content", borderColor: "rgba(11,122,106,0.2)", color: "#0B7A6A", background: "rgba(11,122,106,0.06)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
                  >
                    {tab.badge}
                  </Badge>
                  <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 400, letterSpacing: "-0.025em", color: "#1A2E2B", lineHeight: 1.15 }}>
                    {tab.title}
                  </h3>
                  <p style={{ color: "#6B8A88", fontSize: 15, lineHeight: 1.75 }}>
                    {tab.description}
                  </p>
                  <Button
                    size="lg"
                    className="w-fit gap-2 rounded-full font-semibold"
                    style={{ background: "#0B7A6A", color: "white", fontSize: 14 }}
                  >
                    {tab.buttonText}
                  </Button>
                </div>
                {/* Preview */}
                <div>
                  {tab.preview}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      <style>{`
        [role="tab"][data-state="active"] {
          background: white !important;
          color: #0B7A6A !important;
          border-color: rgba(11,122,106,0.25) !important;
          box-shadow: 0 2px 8px rgba(11,122,106,0.08) !important;
        }
        [role="tab"][data-state="inactive"]:hover {
          background: rgba(255,255,255,0.6) !important;
          color: #1A2E2B !important;
        }
        [role="tabpanel"][data-state="inactive"] {
          display: none !important;
        }
      `}</style>
    </section>
  );
}
