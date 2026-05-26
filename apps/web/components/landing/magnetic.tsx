"use client";

import {
  useRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

type CommonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

/**
 * Magnetic button — pulls toward the cursor on hover, springs back on leave.
 * Renders as an anchor when href is provided, otherwise a button.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  href,
  ...rest
}: CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: string;
  } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className">) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const commonProps = {
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    className: cn("inline-block will-change-transform", className),
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        {...commonProps}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      {...commonProps}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
