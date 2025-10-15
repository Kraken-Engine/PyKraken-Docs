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
    <nav id="top-nav" className="w-full border-b h-16 sticky top-0 z-50 bg-background">
      <div className="sm:container mx-auto w-[95vw] h-full flex items-center sm:justify-between md:gap-2">
        <div className="flex items-center sm:gap-5 gap-2.5">
          <SheetLeftbar />
          <div className="flex items-center gap-6">
            <div className="lg:flex hidden">
              <Logo />
            </div>
            <div className="md:flex hidden items-center gap-6 text-sm font-medium text-muted-foreground">
              <NavMenu />
            </div>
          </div>
        </div>

        <div className="flex items-center sm:justify-normal justify-between sm:gap-3 ml-1 sm:w-fit w-[90%]">
          <AlgoliaSearch {...algolia_props} />
          <div className="flex items-center justify-between sm:gap-2">
            <div className="flex ml-4 sm:ml-0">
              <Link
                id="nav-github-link"
                target="_blank"
                href="https://github.com/Kraken-Engine/PyKraken"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                })}
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
    <Link href="/" className="flex items-center gap-2.5" id="kraken-banner">
      <Image src="/images/site-logo.svg" alt="Kraken Logo" width={32} height={32} />
      <h2 className="text-md font-bold font-code">Kraken Engine</h2>
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
            activeClassName="!text-primary font-medium"
            absolute
            className="nav-item flex items-center gap-1 sm:text-sm text-[14.5px] dark:text-stone-300/85 text-stone-600 hover:text-stone-900 dark:hover:text-stone-200"
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
