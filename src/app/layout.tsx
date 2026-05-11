import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "./posthog-provider";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "VetaIA — L'assistant IA des vétérinaires",
    template: "%s | VetaIA",
  },
  description: "VetaIA est l'assistant IA conçu pour les vétérinaires : comptes-rendus SOAP automatiques, aide au diagnostic, protocoles, dosages et gestion des dossiers patients. Essayez gratuitement.",
  keywords: ["assistant IA vétérinaire", "logiciel vétérinaire intelligence artificielle", "compte rendu consultation vétérinaire", "aide diagnostic vétérinaire", "VetaIA", "logiciel vétérinaire France"],
  authors: [{ name: "VetaIA" }],
  creator: "VetaIA",
  metadataBase: new URL("https://www.vetaia.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.vetaia.fr",
    siteName: "VetaIA",
    title: "VetaIA — L'assistant IA des vétérinaires",
    description: "Comptes-rendus automatiques, aide au diagnostic et gestion des dossiers patients. L'IA conçue pour les vétérinaires français.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VetaIA — L'assistant IA des vétérinaires",
    description: "Comptes-rendus automatiques, aide au diagnostic et gestion des dossiers patients.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "rusil4AYXanKM7LUyBPMdHP5hSfoO1VZfxKNbWx6sWE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.vetaia.fr/#organization",
                "name": "VetaIA",
                "url": "https://www.vetaia.fr",
                "logo": "https://www.vetaia.fr/logo.png",
                "contactPoint": { "@type": "ContactPoint", "email": "kamil@vetaia.fr", "contactType": "customer support", "availableLanguage": "French" }
              },
              {
                "@type": "SoftwareApplication",
                "name": "VetaIA",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "description": "Accès gratuit pendant la bêta" },
                "description": "Assistant IA pour vétérinaires : comptes-rendus SOAP automatiques, aide au diagnostic clinique, dosages médicamenteux, protocoles et gestion des dossiers patients.",
                "url": "https://www.vetaia.fr",
                "publisher": { "@id": "https://www.vetaia.fr/#organization" },
                "audience": { "@type": "Audience", "audienceType": "Vétérinaires diplômés, cliniques vétérinaires, praticiens en médecine animale" },
                "featureList": [
                  "Génération automatique de comptes-rendus SOAP",
                  "Transcription vocale de consultations",
                  "Aide au diagnostic différentiel",
                  "Dosages médicamenteux vétérinaires",
                  "Protocoles anesthésiques",
                  "Gestion des dossiers patients"
                ]
              }
            ]
          })}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "Comment automatiser les comptes-rendus de consultation vétérinaire ?", "acceptedAnswer": { "@type": "Answer", "text": "Avec VetaIA, dictez votre consultation à voix haute. L'assistant transcrit en temps réel et génère un compte-rendu SOAP complet en moins de 30 secondes, prêt à signer." }},
              { "@type": "Question", "name": "VetaIA peut-il aider pour les dosages médicamenteux et protocoles vétérinaires ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui. Posez votre question clinique : dosage d'antibiotique, protocole anesthésique, interactions médicamenteuses. VetaIA répond avec les sources bibliographiques correspondantes." }},
              { "@type": "Question", "name": "Quelle est la différence entre VetaIA et un logiciel de gestion vétérinaire classique ?", "acceptedAnswer": { "@type": "Answer", "text": "Les logiciels de gestion (Vetup, VetManager) gèrent la facturation et les rendez-vous. VetaIA s'occupe du contenu clinique : rédaction des comptes-rendus, aide au diagnostic, réponses aux questions médicales." }},
              { "@type": "Question", "name": "L'assistant IA remplace-t-il le jugement du vétérinaire ?", "acceptedAnswer": { "@type": "Answer", "text": "Non. VetaIA est un outil d'aide à la décision réservé aux vétérinaires diplômés. Le diagnostic et la responsabilité clinique restent entièrement les vôtres." }},
              { "@type": "Question", "name": "VetaIA est-il gratuit pour les vétérinaires ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, entièrement gratuit pendant la bêta — sans carte bancaire, sans limite de consultations. Accès immédiat après inscription." }}
            ]
          })}}
        />
        <PostHogProvider>
          {children}
          <CookieBanner />
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
