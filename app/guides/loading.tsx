export default function GuidesLoading() {
  return (
    <div className="flex items-start gap-10">
      <div className="flex-[4.5] py-10 mx-auto">
        <div className="w-full mx-auto space-y-5">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-11/12 rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="xl:block hidden w-[20rem]" />
    </div>
  );
}
