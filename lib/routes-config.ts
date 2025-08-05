// for page navigation & to sort on leftbar

import { Wind } from "lucide-react";

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  items?: EachRoute[];
  tag?: string;
};

export const ROUTES: EachRoute[] = [
  {
    title: "Getting Started",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Introduction", href: "/introduction" },
      { title: "Installation", href: "/installation" },
      { title: "Creating a Window", href: "/create-window" },
    ],
  },
  {
    title: "Manual",
    href: "/manual",
    noLink: true,
    items: [
      { title: "Constants", href: "/constants" },
    ],
  },
  {
    title: "Classes",
    href: "/classes",
    noLink: true,
    items: [
      { title: "Camera", href: "/camera" },
    ],
  },
  {
    title: "Functions",
    href: "/functions",
    noLink: true,
    items: [
      { title: "Color", href: "/color" },
      { title: "Ease", href: "/ease" },
      { title: "Event", href: "/event" },
      { title: "Gamepad", href: "/gamepad" },
      { title: "Input", href: "/input" },
      { title: "Key", href: "/key" },
      { title: "Math", href: "/math" },
      { title: "Mouse", href: "/mouse" },
      { title: "Rect", href: "/rect" },
      { title: "Time", href: "/time" },
      { title: "Transform", href: "/transform" },
      { title: "Window", href: "/window" },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
