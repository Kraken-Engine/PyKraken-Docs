'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main
      className={`sm:container mx-auto w-[90vw] h-auto scroll-smooth ${isHome ? 'home-background' : ''
        }`}
    >
      {children}
    </main>
  );
}
