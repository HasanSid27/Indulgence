"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Wordmark from "./Wordmark";
import { useSiteData } from "./DataProvider";

gsap.registerPlugin(ScrollTrigger);

/**
 * Opening: paper, negative space, a monumental wordmark. Nothing else competes.
 * Scrolling slowly pulls the wordmark away and lets the studio's world arrive.
 */
export default function Hero() {
  const { settings, content } = useSiteData();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const mark = el.querySelector("[data-mark]");
      const small = el.querySelectorAll("[data-small]");
      const line = el.querySelector("[data-line]");

      gsap.set(mark, { yPercent: 105 });
      gsap.set(small, { opacity: 0, y: 14 });
      gsap.set(line, { scaleY: 0, transformOrigin: "top" });

      const play = () =>
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .to(mark, { yPercent: 0, duration: 1.6 })
          .to(small, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.5)
          .to(line, { scaleY: 1, duration: 1.2 }, 0.9);

      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        play();
      };
      if (document.documentElement.dataset.ready === "true") start();
      else window.addEventListener("indulgence:ready", start, { once: true });

      // Scroll: wordmark recedes slowly; supporting type leaves first.
      gsap.to("[data-hero-mark]", {
        yPercent: -14,
        scale: 0.86,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      // Explicit start values: the fade must always return to fully visible on scroll-up,
      // regardless of what the intro animation was doing when this tween was created.
      gsap.fromTo(
        "[data-hero-ui]",
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -30,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "45% top", scrub: true },
        },
      );

      return () => window.removeEventListener("indulgence:ready", start);
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} data-theme="light" id="top" className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-[var(--gutter)] pb-8 pt-28 md:pt-32">
      <h1 className="sr-only">iNdulgence — premium small-batch dessert studio in {settings.city}</h1>

      <div data-hero-ui className="flex items-start justify-between">
        <p data-small className="eyebrow max-w-[14rem]">
          {settings.descriptor}
        </p>
        <p data-small className="eyebrow text-right">
          {settings.city}, India
        </p>
      </div>

      <div data-hero-mark className="mx-auto w-full max-w-[1500px] origin-center py-10 text-accent will-change-transform">
        <div className="overflow-hidden">
          <div data-mark className="mx-auto w-[min(72vw,900px,calc((100svh-360px)*2.5))] min-w-[260px]">
            <Wordmark />
          </div>
        </div>
        <div data-hero-ui className="mt-6">
          <p data-small className="display text-center text-[clamp(1rem,2.08vw,1.92rem)]">
            {content.heroTagline}
          </p>
        </div>
      </div>

      <div data-hero-ui className="flex items-end justify-between">
        <p data-small className="eyebrow">{content.heroLabelLeft}</p>
        <div data-small className="flex flex-col items-center gap-3">
          <span className="eyebrow">Scroll</span>
          <span data-line className="block h-14 w-px bg-current" />
        </div>
        <p data-small className="eyebrow text-right">{content.heroLabelRight}</p>
      </div>
    </section>
  );
}
