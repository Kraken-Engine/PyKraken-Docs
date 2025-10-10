import { getContentTocs, type ContentSection } from "@/lib/markdown";
import TocObserver from "./toc-observer";
import { ScrollArea } from "@/components/ui/scroll-area";

type TocProps = {
  path: string;
  section?: ContentSection;
};

export default async function Toc({ path, section = "docs" }: TocProps) {
  const tocs = await getContentTocs(section, path);

  return (
    <aside
      className="
    toc xl:flex hidden w-[20rem]
    sticky top-24
    py-6 pl-4 pr-3
    isolate
  "
      aria-label="Table of contents"
    >
      <div
        className="
      relative w-full
      rounded-2xl
      bg-background/70 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md
      ring-1 ring-border/60
      shadow-[0_28px_80px_-48px_rgba(0,0,0,0.55)]
      px-4 py-5
      transform-gpu motion-safe:transition
      motion-safe:hover:-translate-y-0.5

      before:content-[''] before:absolute before:inset-0 before:rounded-2xl
      before:shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]
      dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]

      after:content-[''] after:absolute after:left-6 after:right-6 after:-bottom-5
      after:h-5 after:bg-[radial-gradient(closest-side,rgba(0,0,0,0.25),transparent)]
      after:blur-[10px] after:pointer-events-none
    "
      >
        <h3
          className="
        font-medium text-sm mb-2.5 text-foreground relative
        after:content-[''] after:absolute after:left-0 after:-bottom-1 after:right-0
        after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent
        dark:after:via-white/10
      "
        >
          On this page
        </h3>

        {/* scrolls only if content overflows */}
        <ScrollArea
          className="
        max-h-[70vh]    /* stops before touching footer */
        pr-1 pt-0.5 pb-2 mt-4
        [mask-image:linear-gradient(
          to_bottom,
          transparent,
          rgba(0,0,0,0.15)_10%,
          rgba(0,0,0,0.15)_90%,
          transparent
        )]
        dark:[mask-image:linear-gradient(
          to_bottom,
          transparent,
          rgba(255,255,255,0.08)_10%,
          rgba(255,255,255,0.08)_90%,
          transparent
        )]
        [mask-mode:match-source]
      "
        >
          <TocObserver data={tocs} />
        </ScrollArea>
      </div>
    </aside>
  );
}
