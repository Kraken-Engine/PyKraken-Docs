import { buttonVariants } from "@/components/ui/button";
import { docs_routes, guides_routes } from "@/lib/routes-config";
import { MoveUpRightIcon, TerminalSquareIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex sm:min-h-[87.5vh] min-h-[82vh] flex-col sm:items-center justify-center text-center sm:py-8 py-14 px-6 sm:px-8">
      <Link
        href="https://github.com/Kraken-Engine/PyKraken"
        target="_blank"
        className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4 sm:-mt-12"
        id="view-on-github"
      >
        View on GitHub{" "}
        <MoveUpRightIcon id="move-up-right" className="w-4 h-4 font-extrabold" />
      </Link>
      <h1 className="text-[1.80rem] leading-8 sm:px-8 md:leading-[4.5rem] font-bold mb-4 sm:text-6xl text-left sm:text-center">
        Build powerful 2D games in Python using Kraken Engine.
      </h1>
      <p className="mb-8 md:text-lg text-base  max-w-[1200px] text-muted-foreground text-left sm:text-center">
        A modern, flexible game engine designed for rapid development and creative control.
        With high-level utilities and a clean API, it&apos;s the best pick for solo devs and hobbyists.
      </p>
      <div className="sm:flex sm:flex-row grid grid-cols-2 items-center sm:gap-5 gap-3 mb-8">
        <Link
          href={`/docs${docs_routes[0].href}`}
          className={buttonVariants({ className: "menu-button px-6 sm:w-40", size: "lg" })}
        >
          Read Docs
        </Link>
        <Link
          href={`/guides${guides_routes[0].href}`}
          className={buttonVariants({
            variant: "secondary",
            className: "menu-button px-6 sm:w-40",
            size: "lg",
          })}
        >
          Follow Guides
        </Link>
      </div>
      <span id="pip-install" className="sm:flex hidden flex-row items-start sm:gap-2 gap-0.5 text-muted-foreground text-md mt-5 -mb-12 max-[800px]:mb-12 font-code sm:text-base text-sm font-medium">
        <TerminalSquareIcon className="w-5 h-5 sm:mr-1 mt-0.5" />
        <code className="select-all">pip install kraken-engine</code>
      </span>
    </div>
  );
}
