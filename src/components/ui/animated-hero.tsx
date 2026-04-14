"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["rapports", "consultations", "rendez-vous", "dossiers", "protocoles"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full" style={{ background: "#F3F0EA" }}>
      <div className="container mx-auto px-6">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          {/* Badge */}
          <div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-3 rounded-full text-xs font-semibold tracking-wide"
              style={{ background: "#E0F2EF", color: "#0B7A6A", border: "1px solid rgba(11,122,106,0.18)" }}
            >
              IA entraînée sur données vétérinaires réelles
              <MoveRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Heading */}
          <div className="flex gap-4 flex-col items-center">
            <h1
              className="text-5xl md:text-7xl max-w-3xl tracking-tight text-center font-normal"
              style={{ fontFamily: "'Newsreader', serif", color: "#1A2E2B", letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              <span>L&apos;IA qui automatise vos</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1" style={{ height: "1.2em" }}>
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-normal italic"
                    style={{ color: "#0B7A6A", fontFamily: "'Newsreader', serif" }}
                    initial={{ opacity: 0, y: 80 }}
                    transition={{ type: "spring", stiffness: 60, damping: 18 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -60 : 60, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed max-w-xl text-center"
              style={{ color: "#6B8A88", fontFamily: "'Manrope', sans-serif", lineHeight: 1.75 }}
            >
              Comptes-rendus automatiques, prise de rendez-vous téléphonique, gestion des dossiers —
              Leash AI est entraîné sur de vraies données cliniques vétérinaires pour vous faire gagner
              2 heures par jour.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-row gap-3 flex-wrap justify-center">
            <a
              href="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "#0B7A6A", color: "white", textDecoration: "none",
                padding: "13px 28px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 500,
                boxShadow: "0 4px 18px rgba(11,122,106,0.35)",
              }}
            >
              Essayer gratuitement
              <PhoneCall className="w-4 h-4" />
            </a>
            <a
              href="#comparatif"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "white", color: "#0B7A6A", textDecoration: "none",
                padding: "13px 28px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 500,
                border: "1.5px solid rgba(11,122,106,0.35)",
              }}
            >
              Voir le comparatif
              <MoveRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust signal */}
          <p className="text-sm" style={{ color: "#7A9490", fontFamily: "'DM Sans', sans-serif" }}>
            Accès gratuit pendant la bêta · Aucune carte bancaire requise
          </p>

        </div>
      </div>
    </div>
  );
}

export { Hero };
