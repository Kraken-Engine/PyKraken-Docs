import { PropsWithChildren } from "react";

export function Typography({ children }: PropsWithChildren) {
  return (
    <div className="relative sm:w-full w-[85vw] sm:mx-auto isolate">
      {/* gradient border frame */}
      <div
        className="
          rounded-2xl p-[4px]
          bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]
          dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]
          shadow-[0_28px_80px_-48px_rgba(0,0,0,0.55)]
          transform-gpu motion-safe:transition motion-safe:hover:-translate-y-0.5
          overflow-hidden
        "
      >
        {/* glass layer */}
        <div
          className="
            rounded-[inherit]
            bg-background/70 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md
            ring-1 ring-border/40
          "
        >
          <article
            className="
            rounded-2xl
              prose sm:prose-base prose-sm prose-zinc dark:prose-invert
              max-w-none w-full
              prose-pre:bg-background
              prose-code:font-normal prose-code:font-code prose-code:text-sm prose-code:leading-6
              dark:prose-code:bg-stone-900/25 prose-code:bg-stone-50
              dark:prose-code:text-white prose-code:text-stone-800
              prose-code:rounded-md prose-code:border
              prose-code:before:content-none prose-code:after:content-none
              prose-code:overflow-x-auto
              prose-img:rounded-md prose-img:border prose-img:my-3
              prose-h2:my-4 prose-h2:mt-8 prose-code:break-all md:prose-code:break-normal
              prose-td:px-4
              [&>*]:my-0
              [&>*:first-child]:mt-0
              [&>*:last-child]:mb-0
            "
          >
            {children}
          </article>
        </div>
      </div>

      {/* soft floor shadow, thought it looks fire */}
      <div
        className="
          pointer-events-none absolute left-8 right-8 -bottom-5 h-5
          bg-[radial-gradient(closest-side,rgba(0,0,0,0.25),transparent)]
          blur-[10px]
        "
      />
    </div>
  );
}
