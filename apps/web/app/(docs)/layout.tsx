import { DocsSidebar } from "@/components/site/docs-sidebar";
import { getSidebarGroups } from "@/lib/sidebar-groups";

/**
 * Shared layout for /components/* and /docs/*. The route group `(docs)` is
 * URL-invisible — slugs like /components/button stay as-is. Landing (`/`)
 * lives outside this group and gets no sidebar.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const groups = getSidebarGroups();
  return (
    <>
      {/* Pre-paint: read the persisted collapsed state and stamp <html> with a
          data attribute so first-paint width matches before React hydrates.
          The matching React state in DocsSidebar keeps it in sync after. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var s=localStorage.getItem('appcn:sidebar:collapsed');if(s==='1')document.documentElement.setAttribute('data-sidebar','collapsed');}catch(e){}})();`,
        }}
      />
      <div className="mx-auto flex w-full max-w-screen-2xl">
        <DocsSidebar groups={groups} />
        <main className="min-w-0 flex-1 px-5 py-10 lg:px-10">{children}</main>
      </div>
    </>
  );
}
