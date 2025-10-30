import NextLink from "next/link";
import { ComponentProps } from "react";

export default function Link({ href, ...props }: ComponentProps<"a">) {
  if (!href) return null;

  // Check if the link is external (starts with http:// or https://)
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <NextLink
      href={href}
      {...props}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
    />
  );
}
