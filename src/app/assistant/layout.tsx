import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Assistant IA Vétérinaire — Dosages, Protocoles, Diagnostics",
  description: "Posez vos questions cliniques à VetaIA : dosages médicamenteux, protocoles anesthésiques, diagnostics différentiels, suivi post-opératoire. Réponses sourcées en quelques secondes.",
  openGraph: {
    title: "Assistant IA Vétérinaire — VetaIA",
    description: "Dosages, protocoles, diagnostics différentiels. L'assistant IA conçu pour les vétérinaires diplômés.",
    url: "https://www.vetaia.fr/assistant",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
