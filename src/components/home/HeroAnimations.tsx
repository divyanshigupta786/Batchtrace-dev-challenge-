'use client';

import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export function HeroDecorativeLines() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      // Anime.js v4 path line drawing animation
      animate('.hero-pulse-path', {
        strokeDashoffset: [200, 0],
        duration: 3500,
        ease: 'easeInOutSine',
        loop: true,
      });

      animate('.hero-pulse-dot', {
        opacity: [0.3, 1, 0.3],
        duration: 2000,
        ease: 'easeInOutQuad',
        loop: true,
      });
    } catch (e) {
      // Graceful fallback if animation is interrupted
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="hero-pulse-path"
          d="M-100 200 C 300 120, 600 450, 1100 220 S 1500 350, 1600 400"
          stroke="#527D68"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <path
          className="hero-pulse-path"
          d="M-50 400 C 400 320, 800 150, 1200 350 S 1400 200, 1550 150"
          stroke="#E9A23B"
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />
        <circle className="hero-pulse-dot" cx="450" cy="230" r="4" fill="#E9A23B" />
        <circle className="hero-pulse-dot" cx="850" cy="270" r="5" fill="#527D68" />
        <circle className="hero-pulse-dot" cx="1150" cy="240" r="4" fill="#173D32" />
      </svg>
    </div>
  );
}
