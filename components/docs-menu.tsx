"use client";

import { DOC_ROUTES, GUIDE_ROUTES, EachRoute } from "@/lib/routes-config";
import SubLink from "./sublink";
import { usePathname } from "next/navigation";

type SectionMenuProps = {
  routes: EachRoute[];
  basePath: string;
  matchPrefix: string;
  isSheet?: boolean;
};

function SectionMenu({
  routes,
  basePath,
  matchPrefix,
  isSheet = false,
}: SectionMenuProps) {
  const pathname = usePathname();
  if (!pathname.startsWith(matchPrefix)) return null;

  return (
    <div className="flex flex-col gap-3.5 mt-5 pr-2 pb-6 sm:text-base text-[14.5px]">
      {routes.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `${basePath}${item.href}`,
          level: 0,
          isSheet,
        };
        return (
          <SubLink
            key={`${basePath}-${item.title}-${index}`}
            {...modifiedItems}
          />
        );
      })}
    </div>
  );
}

export default function DocsMenu({ isSheet = false }: { isSheet?: boolean }) {
  return (
    <SectionMenu
      routes={DOC_ROUTES}
      basePath="/docs"
      matchPrefix="/docs"
      isSheet={isSheet}
    />
  );
}

export function GuidesMenu({ isSheet = false }: { isSheet?: boolean }) {
  return (
    <SectionMenu
      routes={GUIDE_ROUTES}
      basePath="/guides"
      matchPrefix="/guides"
      isSheet={isSheet}
    />
  );
}
