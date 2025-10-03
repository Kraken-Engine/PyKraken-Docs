import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import { promises as fs } from "fs";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import {
  docs_routes,
  guides_routes,
  DOC_ROUTES,
  GUIDE_ROUTES,
} from "./routes-config";
import { visit } from "unist-util-visit";
import matter from "gray-matter";
import { getIconName, hasSupportedExtension } from "./utils";

// custom components imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pre from "@/components/markdown/pre";
import Note from "@/components/markdown/note";
import { Stepper, StepperItem } from "@/components/markdown/stepper";
import Image from "@/components/markdown/image";
import Link from "@/components/markdown/link";
import Outlet from "@/components/markdown/outlet";
import Files from "@/components/markdown/files";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ApiSig from "@/components/ApiSig";

// add custom components
const components = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
  Note,
  Stepper,
  StepperItem,
  img: Image,
  a: Link,
  Outlet,
  Files,
  table: Table,
  thead: TableHeader,
  th: TableHead,
  tr: TableRow,
  tbody: TableBody,
  t: TableCell,
  ApiSig,
};

const CONTENT_CONFIG = {
  docs: {
    baseDir: ["contents", "docs"] as const,
    baseHref: "/docs",
    routesTree: DOC_ROUTES,
    flatRoutes: docs_routes,
  },
  guides: {
    baseDir: ["contents", "guides"] as const,
    baseHref: "/guides",
    routesTree: GUIDE_ROUTES,
    flatRoutes: guides_routes,
  },
} as const;

export type ContentSection = keyof typeof CONTENT_CONFIG;

function getSectionConfig(section: ContentSection) {
  return CONTENT_CONFIG[section];
}

function getContentPath(section: ContentSection, slug: string) {
  const config = getSectionConfig(section);
  const segments = slug.split("/").filter(Boolean);
  return path.join(process.cwd(), ...config.baseDir, ...segments, "index.mdx");
}

// can be used for other pages like blogs, Guides etc
async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: rawMdx,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          preProcess,
          rehypeCodeTitles,
          rehypeCodeTitlesWithLogo,
          rehypePrism,
          rehypeSlug,
          rehypeAutolinkHeadings,
          postProcess,
        ],
        remarkPlugins: [remarkGfm],
      },
    },
    components,
  });
}

// logic for docs

export type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

export async function getCompiledContentForSlug(
  section: ContentSection,
  slug: string
) {
  try {
    const contentPath = getContentPath(section, slug);
    const rawMdx = await fs.readFile(contentPath, "utf-8");
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.log(err);
  }
}

export async function getCompiledDocsForSlug(slug: string) {
  return await getCompiledContentForSlug("docs", slug);
}

export async function getCompiledGuidesForSlug(slug: string) {
  return await getCompiledContentForSlug("guides", slug);
}

export async function getContentTocs(
  section: ContentSection,
  slug: string
) {
  const contentPath = getContentPath(section, slug);
  const rawMdx = await fs.readFile(contentPath, "utf-8");
  const headingsRegex = /^(#{2,4})\s(.+)$/gm;
  let match;
  const extractedHeadings = [];
  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2].trim();
    const slug = sluggify(headingText);
    extractedHeadings.push({
      level: headingLevel,
      text: headingText,
      href: `#${slug}`,
    });
  }
  return extractedHeadings;
}

export async function getDocsTocs(slug: string) {
  return await getContentTocs("docs", slug);
}

export async function getGuidesTocs(slug: string) {
  return await getContentTocs("guides", slug);
}

export function getPreviousNext(
  path: string,
  section: ContentSection = "docs"
) {
  const { flatRoutes } = getSectionConfig(section);
  const index = flatRoutes.findIndex(({ href }) => href === `/${path}`);
  return {
    prev: index > 0 ? flatRoutes[index - 1] : undefined,
    next: index >= 0 ? flatRoutes[index + 1] : undefined,
  };
}

function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, "-");
  return slug.replace(/[^a-z0-9-]/g, "");
}

function justGetFrontmatterFromMD<Frontmatter>(rawMd: string): Frontmatter {
  return matter(rawMd).data as Frontmatter;
}

export async function getContentFrontmatter(
  section: ContentSection,
  path: string
) {
  try {
    const contentPath = getContentPath(section, path);
    const rawMdx = await fs.readFile(contentPath, "utf-8");
    return justGetFrontmatterFromMD<BaseMdxFrontmatter>(rawMdx);
  } catch {
    return undefined;
  }
}

export async function getDocFrontmatter(path: string) {
  return await getContentFrontmatter("docs", path);
}

export async function getGuideFrontmatter(path: string) {
  return await getContentFrontmatter("guides", path);
}

function normalizeRouteHref(href: string) {
  return href.replace(/^\//, "");
}

export async function getAllChilds(
  pathString: string,
  section: ContentSection = "docs"
) {
  const items = pathString.split("/").filter(Boolean);
  const config = getSectionConfig(section);
  const { routesTree, baseHref, baseDir } = config;

  let routesCursor = routesTree;
  let accumulatedHref = "";

  for (const segment of items) {
    const found = routesCursor.find(
      (route) => normalizeRouteHref(route.href) === segment
    );
    if (!found) break;
    accumulatedHref += found.href;
    routesCursor = found.items ?? [];
  }

  if (!accumulatedHref) return [];

  return await Promise.all(
    routesCursor.map(async (route) => {
      const totalHref = `${accumulatedHref}${route.href}`;
      const slugSegments = totalHref.split("/").filter(Boolean);
      const totalPath = path.join(
        process.cwd(),
        ...baseDir,
        ...slugSegments,
        "index.mdx"
      );
      const raw = await fs.readFile(totalPath, "utf-8");
      return {
        ...justGetFrontmatterFromMD<BaseMdxFrontmatter>(raw),
        href: `${baseHref}${totalHref}`,
      };
    })
  );
}

// for copying the code in pre
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const preProcess = () => (tree: any) => {
  visit(tree, (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      const [codeEl] = node.children;
      if (codeEl.tagName !== "code") return;
      node.raw = codeEl.children?.[0].value;
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postProcess = () => (tree: any) => {
  visit(tree, "element", (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      node.properties["raw"] = node.raw;
    }
  });
};

export type Author = {
  avatar?: string;
  handle: string;
  username: string;
  handleUrl: string;
};

export type BlogMdxFrontmatter = BaseMdxFrontmatter & {
  date: string;
  authors: Author[];
  cover: string;
};

export async function getAllBlogStaticPaths() {
  try {
    const blogFolder = path.join(process.cwd(), "/contents/blogs/");
    const res = await fs.readdir(blogFolder);
    return res.map((file) => file.split(".")[0]);
  } catch (err) {
    console.log(err);
  }
}

export async function getAllBlogsFrontmatter() {
  const blogFolder = path.join(process.cwd(), "/contents/blogs/");
  const files = await fs.readdir(blogFolder);
  const uncheckedRes = await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".mdx")) return undefined;
      const filepath = path.join(process.cwd(), `/contents/blogs/${file}`);
      const rawMdx = await fs.readFile(filepath, "utf-8");
      return {
        ...justGetFrontmatterFromMD<BlogMdxFrontmatter>(rawMdx),
        slug: file.split(".")[0],
      };
    })
  );
  return uncheckedRes.filter((it) => !!it) as (BlogMdxFrontmatter & {
    slug: string;
  })[];
}

export async function getCompiledBlogForSlug(slug: string) {
  const blogFile = path.join(process.cwd(), "/contents/blogs/", `${slug}.mdx`);
  try {
    const rawMdx = await fs.readFile(blogFile, "utf-8");
    return await parseMdx<BlogMdxFrontmatter>(rawMdx);
  } catch {
    return undefined;
  }
}

export async function getBlogFrontmatter(slug: string) {
  const blogFile = path.join(process.cwd(), "/contents/blogs/", `${slug}.mdx`);
  try {
    const rawMdx = await fs.readFile(blogFile, "utf-8");
    return justGetFrontmatterFromMD<BlogMdxFrontmatter>(rawMdx);
  } catch {
    return undefined;
  }
}

function rehypeCodeTitlesWithLogo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (
        node?.tagName === "div" &&
        node?.properties?.className?.includes("rehype-code-title")
      ) {
        const titleTextNode = node.children.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (child: any) => child.type === "text"
        );
        if (!titleTextNode) return;

        // Extract filename and language
        const titleText = titleTextNode.value;
        const match = hasSupportedExtension(titleText);
        if (!match) return;

        const splittedNames = titleText.split(".");
        const ext = splittedNames[splittedNames.length - 1];
        const iconClass = `devicon-${getIconName(ext)}-plain text-[17px]`;

        // Insert icon before title text
        if (iconClass) {
          node.children.unshift({
            type: "element",
            tagName: "i",
            properties: { className: [iconClass, "code-icon"] },
            children: [],
          });
        }
      }
    });
  };
}
