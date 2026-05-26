import { components } from "@/lib/registry";
import { DocsNav } from "@/components/site/docs-nav";

/**
 * /components/* layout — sidebar with Base + AI sections on the left, content on
 * the right. The sidebar is a client component so it can highlight the active
 * route (layouts don't re-render in Next 16).
 */
export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-5 py-12">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20">
          <DocsNav components={components} />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
