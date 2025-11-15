'use client';

import Link from "next/link";
import { CommandIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <footer className={`border-t w-full h-16 ${isHome ? 'fixed bottom-0 left-0 right-0' : ''}`}>
      <div className={`container flex items-center sm:justify-between justify-center sm:gap-0 gap-4 h-full text-muted-foreground text-sm flex-wrap sm:py-0 py-3 max-sm:px-4 ${isHome ? 'bg-background' : ''}`}>
        <div className="flex items-center gap-3">
          <CommandIcon className="sm:block hidden w-5 h-5 text-muted-foreground" />
          <p className="text-center">
            Built by{""}
            <Link
              className="px-1 underline underline-offset-2"
              href="https://github.com/durkisneer1"
              target="_blank"
              rel="noopener noreferrer"
            >
              durkisneer1
            </Link>
            . Kraken Engine is open source and available on{""}
            <Link
              className="px-1 underline underline-offset-2"
              href="https://github.com/durkisneer1/PyKraken"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
