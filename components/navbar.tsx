import { ModeToggle } from "@/components/theme-toggle";
import { GithubIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import Anchor from "./anchor";
import { SheetLeftbar } from "./leftbar";
import { docs_routes, guides_routes } from "@/lib/routes-config";
import { SheetClose } from "@/components/ui/sheet";
import AlgoliaSearch from "./algolia-search";
import Image from "next/image";

export const NAVLINKS = [
  {
    title: "Documentation",
    href: `/docs${docs_routes[0].href}`,
  },
  {
    title: "Guides",
    href: `/guides${guides_routes[0].href}`,
  },
  {
    title: "Showcase",
    href: "/showcase",
  },
  {
    title: "Community",
    href: "https://discord.gg/jMdx9UmqX8",
  },
];

const algolia_props = {
  appId: process.env.ALGOLIA_APP_ID!,
  indexName: process.env.ALGOLIA_INDEX!,
  apiKey: process.env.ALGOLIA_SEARCH_API_KEY!,
};

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50
        h-16 w-full
        bg-background/80 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md
        border-b border-border/60
        shadow-lg
        nav-3d isolate
        before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px
        before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
        dark:before:via-white/10
        after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-px
        after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent
        dark:after:via-white/5
        transform-gpu"
      role="navigation"
      aria-label="Global"
    >
      <div className="sm:container mx-auto w-[95vw] h-full flex items-center sm:justify-between md:gap-2">
        <div className="flex items-center sm:gap-5 gap-2.5">
          <SheetLeftbar />
          <div className="flex items-center gap-6 ">
            <div className="lg:flex hidden">
              <Logo />
            </div>
            <div className="md:flex hidden items-center gap-4 text-sm font-medium text-muted-foreground">
              <NavMenu />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="hidden sm:flex items-center
              rounded-xl
              
              shadow-[0_12px_28px_-16px_rgba(0,0,0,0.45)]
              motion-safe:transition
              motion-safe:hover:-translate-y-0.5
              transform-gpu"
        >
          <AlgoliaSearch {...algolia_props} />
          <div className="flex items-center justify-between sm:gap-2">
            <div className="flex ml-4 sm:ml-0">
              <Link
                href="https://github.com/Kraken-Engine/PyKraken"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className: `
                    transform-gpu motion-safe:transition
                    motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-[1px]
                    motion-safe:hover:shadow-md
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ml-4
                  `,
                })}
                aria-label="GitHub repository"
              >
                <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5
        transform-gpu motion-safe:transition
        motion-safe:hover:-translate-y-0.5"
      id="kraken-banner"
    >
      <div
        className="
          relative aspect-square h-8 w-8
          rounded-lg overflow-hidden
          ring-1 ring-black/5 dark:ring-white/5
          shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_18px_-10px_rgba(0,0,0,0.5)]
          dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-12px_rgba(0,0,0,0.7)]
          transform-gpu motion-safe:transition
          motion-safe:group-hover:rotate-[1.5deg] motion-safe:group-hover:scale-[1.02]
        "
      >
        <Image
          src="/images/faviconcircle.png"
          alt="Kraken Logo"
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>

      <h2
        className="text-md font-bold font-code text-foreground
          drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]
          dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]"
      >
        Kraken Engine
      </h2>
    </Link>
  );
}

export function NavMenu({ isSheet = false }) {
  return (
    <>
      {NAVLINKS.map((item) => {
        const Comp = (
          <Anchor
            key={item.title + item.href}
            activeClassName="text-primary dark:font-medium font-semibold"
            absolute
            className="relative inline-flex items-center gap-1
              sm:text-sm text-[14.5px]
              text-stone-800 dark:text-stone-300/85
              transform-gpu motion-safe:transition
              motion-safe:hover:-translate-y-0.5
              hover:text-white dark:hover:text-white
              after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1
              after:h-[2px] after:rounded-full
              after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent
              dark:after:via-white/30
              after:opacity-0 motion-safe:hover:after:opacity-100
              hover:drop-shadow
               focus-visible:ring-2 focus-visible:ring-primary/40 rounded
              px-1"
            href={item.href}
          >
            {item.title}
          </Anchor>
        );
        return isSheet ? (
          <SheetClose key={item.title + item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
