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
    <div className="xl:flex toc hidden w-[20rem] py-9 sticky top-16 h-[96.95vh] pl-6">
      <div id="small-toc" className="small-toc flex flex-col gap-3 w-full pl-2">
        <h3 className="font-medium text-sm" id="on-this-page">On this page</h3>
        <ScrollArea className="pb-2 pt-0.5 overflow-y-auto">
          <TocObserver data={tocs} />
        </ScrollArea>
      </div>
    </div>
  );
}
