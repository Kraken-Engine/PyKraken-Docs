import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

type DocsBreadcrumbProps = {
  paths: string[];
  rootLabel?: string;
};

export default function DocsBreadcrumb({
  paths,
  rootLabel = "Docs",
}: DocsBreadcrumbProps) {
  const rootHref = rootLabel.toLowerCase() === "guides" ? "/guides" : "/docs";

  return (
    <div className="pb-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={rootHref}>{rootLabel}</BreadcrumbLink>
          </BreadcrumbItem>
          {paths.map((path, index) => {
            const href = `${rootHref}/${paths.slice(0, index + 1).join("/")}`;
            return (
              <Fragment key={path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index < paths.length - 1 ? (
                    <BreadcrumbLink href={href}>
                      {toTitleCase(path)}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>
                      {toTitleCase(path)}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function toTitleCase(input: string): string {
  const words = input.split("-");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
}
