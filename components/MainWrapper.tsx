'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
            className="fixed top-0 left-0 w-screen h-screen object-cover z-[-1] pointer-events-none opacity-[0.15] dark:opacity-20"
          >
            <source src="/videos/doc-bg.webm" type="video/webm" />
            <source src="/videos/doc-bg.mp4" type="video/mp4" />
          </video>
          <div
            className="fixed top-0 left-0 w-screen h-screen z-[-1] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,rgba(220,225,235,0.6)_100%)] dark:bg-[radial-gradient(ellipse,rgba(200,200,200,0.05)_2%,rgba(0,0,0,0.4)_100%)]"
          />
        </>
      )}
      <main className={`sm:container mx-auto w-[90vw] ${isHome ? 'h-full' : 'h-auto'} scroll-smooth`}>
        {children}
      </main>
    </div>
  );
}
