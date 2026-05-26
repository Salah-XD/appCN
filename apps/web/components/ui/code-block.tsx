import { CopyButton } from "@/components/ui/copy-button";

/**
 * Plain monospace code block with a copy button. Intentionally no syntax
 * highlighting — keeps the docs site dependency-free and renders identically
 * server-side. Pair with a small section heading where used.
 */
export function CodeBlock({
  code,
  label = "Copy",
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "relative rounded-xl border border-border bg-background " +
        (className ?? "")
      }
    >
      <div className="absolute right-2 top-2">
        <CopyButton value={code} label={label} />
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}
