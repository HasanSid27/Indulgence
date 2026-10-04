"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Small blend-mode cursor, fine pointers only. Grows over links and [data-cursor]. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
    const el = ref.current;
    if (!fine || !el) return;
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      el.dataset.active = "true";
      x(e.clientX);
      y(e.clientY);
      const t = e.target as HTMLElement | null;
      el.dataset.hover = String(!!t?.closest("a, button, [data-cursor]"));
    };
    const leave = () => (el.dataset.active = "false");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden />;
}
