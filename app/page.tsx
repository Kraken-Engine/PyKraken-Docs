import { buttonVariants } from "@/components/ui/button";
import { docs_routes, guides_routes } from "@/lib/routes-config";
import { MoveUpRightIcon, TerminalSquareIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="
        relative flex flex-col justify-center sm:items-center text-center
        sm:min-h-[87.5vh] min-h-[82vh] sm:py-8 py-14
        isolate overflow-hidden
      "
    >
      {/* Light focus/spotlight effect (barely visible) */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,transparent_65%)]
          dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_65%)]
        "
      />

      <Link
        href="https://github.com/Kraken-Engine/PyKraken"
        target="_blank"
        className="
          group mb-5 sm:text-lg flex items-center gap-2
          underline underline-offset-4 sm:-mt-12
          transform-gpu motion-safe:transition
          motion-safe:hover:-translate-y-0.5
        "
      >
        View on GitHub
        <MoveUpRightIcon className="w-4 h-4 font-extrabold motion-safe:transition group-hover:translate-x-0.5 -translate-y-0.5" />
      </Link>

      <h1
        className="
          text-[1.80rem] sm:text-6xl font-bold mb-4 text-left sm:text-center
          leading-8 md:leading-[4.5rem]
          drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]
          dark:drop-shadow-[0_2px_2px_rgba(255,255,255,0.1)]
          motion-safe:transition
          motion-safe:hover:-translate-y-0.5
          transform-gpu
        "
      >
        Build powerful 2D games in Python using Kraken Engine.
      </h1>

      <p
        className="
          mb-8 md:text-lg text-base max-w-[1200px]
          text-muted-foreground text-left sm:text-center mx-auto
          drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]
          dark:drop-shadow-[0_1px_1px_rgba(255,255,255,0.06)]
        "
      >
        A modern, flexible game engine designed for rapid development and creative control.
        With high-level utilities and a clean API, it&apos;s the best pick for solo devs and hobbyists.
      </p>

      <div
        className="
          sm:flex sm:flex-row grid grid-cols-2 items-center sm:gap-5 gap-3 mb-8 justify-center
        "
      >
        <Link
          href={`/docs${docs_routes[0].href}`}
          className={buttonVariants({
            className: `
              px-6 transform-gpu motion-safe:transition
              motion-safe:hover:-translate-y-0.5 active:translate-y-[1px]
              shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]
              hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.55)]
              relative
              before:content-[''] before:absolute before:inset-0 before:rounded-[inherit]
              before:shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]
              dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            `,
            size: "lg",
          })}
        >
          Read Docs
        </Link>

        <Link
          href={`/guides${guides_routes[0].href}`}
          className={buttonVariants({
            variant: "secondary",
            className: `
              px-6 transform-gpu motion-safe:transition
              motion-safe:hover:-translate-y-0.5 active:translate-y-[1px]
              shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]
              hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.5)]
              relative
              before:content-[''] before:absolute before:inset-0 before:rounded-[inherit]
              before:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]
              dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            `,
            size: "lg",
          })}
        >
          Follow Guides
        </Link>
      </div>

      <div
        className="
          hidden sm:flex items-center justify-center
          relative mx-auto w-fit px-4 py-2 mt-5 -mb-12
          rounded-xl font-code sm:text-base text-sm font-medium
          text-muted-foreground
          bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur
          ring-1 ring-border/60
          shadow-[0_15px_40px_-20px_rgba(0,0,0,0.5)]
          before:content-[''] before:absolute before:inset-0 before:rounded-xl
          before:shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]
          dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
          transform-gpu motion-safe:transition
          motion-safe:hover:-translate-y-0.5
        "
      >
        <TerminalSquareIcon className="w-5 h-5 sm:mr-2 mt-0.5 opacity-80" />
        <code className="select-all">pip install kraken-engine</code>
      </div>
    </div>
  );
}
