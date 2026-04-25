'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHome = pathname === '/';

  // Ensure video plays after mount
  useEffect(() => {
    if (isHome && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Silently handle autoplay issues
      });
    }
  }, [isHome]);

  const isDark = resolvedTheme === 'dark' || theme === 'dark' || (!resolvedTheme && !theme);

  return (
    <div className={`relative w-full ${isHome ? 'h-[calc(100vh-4rem)] overflow-hidden home-background' : ''}`}>
      {isHome && (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster="/images/bg-thumbnail.webp"
            className={`fixed top-0 left-0 w-screen h-screen object-cover z-[-1] pointer-events-none ${isDark ? 'opacity-20' : 'opacity-15'
              }`}
          >
            <source src="/videos/doc-bg.webm" type="video/webm" />
            <source src="/videos/doc-bg.mp4" type="video/mp4" />
          </video>
          <div
            key={`gradient-${resolvedTheme || theme}`}
            className="fixed top-0 left-0 w-screen h-screen z-[-1] pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse, rgba(200, 200, 200, 0.05) 2%, rgba(0, 0, 0, 0.4) 100%)'
                : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, rgba(220, 225, 235, 0.6) 100%)'
            }}
          />
        </>
      )}
      <main className={`sm:container mx-auto w-[90vw] ${isHome ? 'h-full' : 'h-auto'} scroll-smooth`}>
        {children}
      </main>
    </div>
  );
}
