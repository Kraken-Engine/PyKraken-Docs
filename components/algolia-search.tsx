"use client";

import { DocSearch } from "@docsearch/react";

type AlgoliaProps = {
  appId: string;
  indexName: string;
  apiKey: string;
};

export default function AlgoliaSearch(props: AlgoliaProps) {
  return (
    <div className="navbar-search relative shrink-0 max-w-[calc(100vw-8.5rem)]">
      <div className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-0.5 text-xs font-code sm:flex pointer-events-none">
        <div className="bg-background/30 border rounded-md py-0.5 px-1 dark:border-neutral-700 border-neutral-300">
          Ctrl
        </div>
        <div className="bg-background/30 border rounded-md py-0.5 px-[0.28rem] dark:border-neutral-700 border-neutral-300">
          K
        </div>
      </div>
      <DocSearch {...props} maxResultsPerGroup={8} />
    </div>
  );
}
