'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className={`relative w-full ${isHome ? 'home-background' : ''}`}>
      {isHome && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed top-0 left-0 w-screen h-screen object-cover opacity-20 z-[-1] pointer-events-none"
        >
          <source src="/videos/doc-bg.mp4" type="video/mp4" />
        </video>
      )}
      <main className="sm:container mx-auto w-[90vw] h-auto scroll-smooth">
        {children}
      </main>
    </div>
  );
}
