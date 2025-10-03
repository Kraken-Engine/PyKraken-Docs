import DocsBreadcrumb from "@/components/docs-breadcrumb";
import Pagination from "@/components/pagination";
import Toc from "@/components/toc";
import { guides_routes } from "@/lib/routes-config";
import { notFound } from "next/navigation";
import {
  getCompiledGuidesForSlug,
  getGuideFrontmatter,
} from "@/lib/markdown";
import { Typography } from "@/components/typography";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function DocsPage(props: PageProps) {
  const params = await props.params;
  const { slug = [] } = params;

  const pathName = slug.join("/");
  const res = await getCompiledGuidesForSlug(pathName);

  if (!res) notFound();
  return (
    <div className="flex items-start gap-10">
      <div className="flex-[4.5] py-10 mx-auto">
        <div className="w-full mx-auto">
          <DocsBreadcrumb paths={slug} rootLabel="Guides" />
          <Typography>
            <h1 className="sm:text-3xl text-2xl !-mt-0.5">
              {res.frontmatter.title}
            </h1>
            <p className="-mt-4 text-muted-foreground sm:text-[16.5px] text-[14.5px]">
              {res.frontmatter.description}
            </p>
            <div>{res.content}</div>
            <Pagination pathname={pathName} section="guides" />
          </Typography>
        </div>
      </div>

      <Toc path={pathName} section="guides" />
    </div>
  );
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { slug = [] } = params;

  const pathName = slug.join("/");
  const res = await getGuideFrontmatter(pathName);
  if (!res) return {};
  const { title, description } = res;
  return {
    title,
    description,
  };
}

export function generateStaticParams() {
  return guides_routes.map((item) => ({
    slug: item.href.split("/").slice(1),
  }));
}
