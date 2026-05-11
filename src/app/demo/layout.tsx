import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Essayer VetaIA gratuitement — Démo en ligne",
  description: "Testez l'assistant IA vétérinaire sans inscription. Posez une vraie question clinique et obtenez une réponse sourcée en quelques secondes. Gratuit et sans carte bancaire.",
  openGraph: {
    title: "Démo VetaIA — Testez l'assistant IA vétérinaire",
    description: "Essayez gratuitement : posez une question clinique et obtenez une réponse en quelques secondes.",
    url: "https://www.vetaia.fr/demo",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
