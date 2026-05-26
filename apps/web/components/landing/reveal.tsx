"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Fade + lift on scroll-in. Wraps any block and reveals it as it enters the
 * viewport. `delay` staggers groups; `as` swaps the rendered tag.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  y?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          delay,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: ref, dependencies: [delay, y] }
  );

  // Cast because TS can't infer the ref type from a dynamic tag.
  const Component = Tag as unknown as React.ElementType;
  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(className)}
      style={{ opacity: 0 }}
    >
      {children}
    </Component>
  );
}
