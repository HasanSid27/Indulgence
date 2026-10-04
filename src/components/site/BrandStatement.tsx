"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useSiteData } from "./DataProvider";

gsap.registerPlugin(ScrollTrigger);

/** Scroll-time units: each statement is held for HOLD, and crossfades over CROSS. */
const HOLD = 0.7;
const CROSS = 1;
/** Viewport heights of scrolling per unit while pinned. */
const VH_PER_UNIT = 62;

/**
 * Pinned pause between chapters. Each line takes over the screen in turn.
 * Without motion (or JS) the lines simply stack — all content remains available.
 */
export default function BrandStatement() {
  const { content } = useSiteData();
  const statements = content.statements;
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-pinned");
      const lines = gsap.utils.toArray<HTMLElement>("[data-stmt]", el);
      gsap.set(lines, { opacity: 0, yPercent: 30 });
      gsap.set(lines[0], { opacity: 1, yPercent: 0 });

      // hold line 1 → crossfade to the next → hold, then release the pin so the page carries on
      const units = HOLD + (lines.length - 1) * (CROSS + HOLD);
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${Math.round(units * VH_PER_UNIT)}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.to({}, { duration: HOLD });
      lines.forEach((l, i) => {
        if (i === 0) return;
        tl.to(lines[i - 1], { opacity: 0, yPercent: -30, duration: CROSS })
          .to(l, { opacity: 1, yPercent: 0, duration: CROSS }, "<0.1")
          .to({}, { duration: HOLD });
      });
      return () => el.classList.remove("is-pinned");
    }, root);
    return () => mm.revert();
  }, [statements.length]);

  return (
    <section ref={root} data-theme="dark" aria-label="Brand statements" className="statement relative px-[var(--gutter)] py-[clamp(5rem,10vw,9rem)]">
      <style>{`
        .statement.is-pinned { min-height: 100svh; display: grid; place-items: center; padding-block: 0; }
        .statement.is-pinned .stmt-wrap { position: relative; width: 100%; height: 100svh; }
        .statement.is-pinned [data-stmt] { position: absolute; inset: 0; display: grid; place-items: center; }
      `}</style>
      <div className="stmt-wrap mx-auto max-w-[1700px]">
        {statements.map((s) => (
          <p
            key={s}
            data-stmt
            className="display py-8 text-center text-[clamp(2.4rem,8vw,7.5rem)] leading-[0.98] [text-wrap:balance] first:pt-0"
          >
            {s}
          </p>
        ))}
      </div>
    </section>
  );
}
