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
        <PostHogProvider>
          {children}
          <CookieBanner />
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
