'use client';

import React, { useMemo } from 'react';

export const StarBackground: React.FC<{className?: string}> = ({ className }) => {
  const starCount = 50;
  
  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      tailLength: `${(Math.random() * 250 + 500) / 100}em`,
      topOffset: `${(Math.random() * 10000) / 100}vh`,
      fallDuration: `${(Math.random() * 6000 + 6000) / 1000}s`,
      fallDelay: `${(Math.random() * 10000) / 1000}s`,
    }));
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className || 'bg-transparent'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .stars-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 140%;
          transform: rotate(-45deg);
        }

        .shooting-star {
          --star-color: var(--primary);
          --star-tail-height: 2px;
          --star-width: calc(var(--star-tail-length) / 6);
          
          position: absolute;
          top: var(--top-offset);
          left: 0;
          width: var(--star-tail-length);
          height: var(--star-tail-height);
          color: var(--star-color);
          background: linear-gradient(45deg, currentColor, transparent);
          border-radius: 50%;
          filter: drop-shadow(0 0 6px currentColor);
          transform: translate3d(104em, 0, 0);
          animation: fall var(--fall-duration) var(--fall-delay) linear infinite, tail-fade var(--fall-duration) var(--fall-delay) ease-out infinite;
        }

        @media screen and (max-width: 750px) {
          .shooting-star {
            animation: fall var(--fall-duration) var(--fall-delay) linear infinite;
          }
        }

        .shooting-star::before, .shooting-star::after {
          position: absolute;
          content: '';
          top: 0;
          left: calc(var(--star-width) / -2);
          width: var(--star-width);
          height: 100%;
          background: linear-gradient(45deg, transparent, currentColor, transparent);
          border-radius: inherit;
          animation: blink 2s linear infinite;
        }

        .shooting-star::before { transform: rotate(45deg); }
        .shooting-star::after { transform: rotate(-45deg); }

        @keyframes fall {
          to { transform: translate3d(-30em, 0, 0); }
        }

        @keyframes tail-fade {
          0%, 50% { width: var(--star-tail-length); opacity: 1; }
          70%, 80% { width: 0; opacity: 0.4; }
          100% { width: 0; opacity: 0; }
        }

        @keyframes blink {
          50% { opacity: 0.6; }
        }
      `}} />
      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className="shooting-star"
            style={{
              // @ts-ignore
              '--star-tail-length': star.tailLength,
              '--top-offset': star.topOffset,
              '--fall-duration': star.fallDuration,
              '--fall-delay': star.fallDelay,
            }}
          />
        ))}
      </div>
    </div>
  );
};
