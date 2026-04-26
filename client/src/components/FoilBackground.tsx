'use client';

import React from 'react';

const symbols = [
  "🟄", "❉", "🟉", "❈", "✣", "🞯", "🟎", "♦", "✢", "🞵", "✤", "✦", "❇", "🞻", "✶", "✳", "❊", "🟄", "✻", "❋", "✷", "✴", "🟄"
];

export const FoilBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden bg-white dark:bg-[#030a06] pointer-events-none -z-10 select-none">
      {/* Base Background Image Layer */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-40"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1615800098779-1be32e60cca3?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2OTUyNDAwMTN8&ixlib=rb-4.0.3&q=85)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      <div id="background-symbols">
        {Array.from({ length: 23 }).map((_, i) => {
          const symbol = symbols[i % symbols.length];
          const posX = `${(i * 5) % 100}vw`;
          const size = `${3 + (i % 5)}vw`;
          const durationMove = `${6 + (i % 4)}s`;
          const delayMove = `-${i % 8}s`;
          const durationRotate = `${1 + (i % 6) * 0.1}s`;
          const delayRotate = `${(i % 7) * 0.3}s`;
          const hue = `${(i % 12) * 30}deg`;
          
          return (
            <div
              key={i}
              className="absolute top-0 left-0 font-['Noto_Sans_Symbols_2',_sans-serif] origin-top opacity-60 dark:opacity-80"
              style={{
                fontSize: `clamp(15px, ${size}, 80px)`,
                animation: `foil-move ${durationMove} ${delayMove} linear infinite normal both`,
                // @ts-ignore
                '--pos_x': posX,
                '--size': size,
              }}
            >
              <span 
                className="block origin-center"
                style={{
                  transform: 'rotate(0deg)',
                  animation: `foil-rotate ${durationRotate} ${delayRotate} ease-in-out infinite alternate both`,
                }}
              >
                <div 
                  className={`foil-symbol ${i % 2 === 0 ? '' : 'foil-symbol-even'}`}
                  style={{
                    // @ts-ignore
                    '--symbol': `"${symbol}"`,
                    '--hue': hue,
                    '--duration_clip': '10s',
                    '--delay_clip': '0s',
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
