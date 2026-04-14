'use client';
import * as React from 'react';

interface AiLoaderProps {
  size?: number;
  text?: string;
}

export const AiLoader: React.FC<AiLoaderProps> = ({
  size = 52,
  text = '',
}) => {
  const letters = text.split('');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size + 16,
          height: size + 16,
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {/* Spinning circle */}
        <div className="leash-loader-circle" style={{ position: 'absolute', inset: 8, borderRadius: '50%' }} />

        {/* Letters arranged in a circle */}
        {letters.map((letter, index) => {
          const angle = (index / letters.length) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const r = size * 0.35;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <span
              key={index}
              className="leash-loader-letter"
              style={{
                position: 'absolute',
                fontSize: size * 0.09,
                fontWeight: 600,
                color: '#0B7A6A',
                letterSpacing: '0.04em',
                fontFamily: "'Geist', sans-serif",
                transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {letter}
            </span>
          );
        })}

      </div>
      <span style={{ fontSize: 12, color: '#6B8F8A', fontWeight: 500, fontFamily: "'Geist', sans-serif" }}>
        Génération en cours…
      </span>

      <style jsx>{`
        @keyframes leashLoaderCircle {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 6px 12px 0 rgba(11, 122, 106, 0.5) inset,
              0 12px 18px 0 rgba(13, 156, 135, 0.4) inset,
              0 36px 36px 0 rgba(11, 122, 106, 0.25) inset,
              0 0 4px 2px rgba(11, 122, 106, 0.15),
              0 0 8px 2px rgba(13, 156, 135, 0.1);
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 6px 12px 0 rgba(13, 156, 135, 0.6) inset,
              0 12px 6px 0 rgba(8, 93, 80, 0.4) inset,
              0 24px 36px 0 rgba(11, 122, 106, 0.3) inset,
              0 0 4px 2px rgba(11, 122, 106, 0.2),
              0 0 8px 2px rgba(13, 156, 135, 0.12);
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 6px 12px 0 rgba(11, 122, 106, 0.5) inset,
              0 12px 18px 0 rgba(13, 156, 135, 0.4) inset,
              0 36px 36px 0 rgba(11, 122, 106, 0.25) inset,
              0 0 4px 2px rgba(11, 122, 106, 0.15),
              0 0 8px 2px rgba(13, 156, 135, 0.1);
          }
        }

        @keyframes leashLoaderLetter {
          0%, 100% {
            opacity: 0.3;
            transform: var(--letter-transform) scale(0.9);
          }
          20% {
            opacity: 1;
            transform: var(--letter-transform) scale(1.2);
          }
          40% {
            opacity: 0.6;
            transform: var(--letter-transform) scale(1);
          }
        }

        @keyframes leashLoaderDot {
          0%, 100% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .leash-loader-circle {
          animation: leashLoaderCircle 4s linear infinite;
        }

        .leash-loader-letter {
          animation: leashLoaderLetter 2.4s infinite ease-in-out;
        }

        .leash-loader-dot {
          animation: leashLoaderDot 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
