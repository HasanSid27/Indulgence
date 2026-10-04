"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { TransitionLink } from "./PageTransition";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
  download?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Subtly magnetic CTA. Magnetism is disabled on touch and reduced-motion. */
export default function Button({ href, children, variant = "solid", external, download, className = "", ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const cls = `btn btn-${variant} ${className}`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.22,
      y: (e.clientY - (r.top + r.height / 2)) * 0.3,
      duration: 0.5,
      ease: "power3.out",
    });
  };
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });

  const inner = (
    <>
      <span>{children}</span>
      <span className="arrow" aria-hidden>→</span>
    </>
  );

  if (external || download) {
    return (
      <a
        ref={ref}
        href={href}
        className={cls}
        data-cursor
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        {...(download ? { download: true } : {})}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <TransitionLink ref={ref} href={href} className={cls} data-cursor aria-label={ariaLabel} onPointerMove={onMove} onPointerLeave={onLeave}>
      {inner}
    </TransitionLink>
  );
}
