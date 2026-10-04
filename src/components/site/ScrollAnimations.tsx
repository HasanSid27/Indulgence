"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const THEMES = {
  light: { "--bg": "#f6f1eb", "--fg": "#1b0d0e", "--accent": "#8d1a1c" },
  dark: { "--bg": "#8d1a1c", "--fg": "#f6f1eb", "--accent": "#ffffff" },
} as const;

/**
 * Declarative scroll system. Components mark up their DOM with data attributes:
 *   data-theme="light|dark"   chapter colour environment (page background tween)
 *   data-split                masked word-by-word reveal (SplitText)
 *   data-scrub-words          words light up as you scroll through a paragraph
 *   data-fade                 subtle opacity/translate reveal
 *   data-scrub-draw          line drawing traced left→right by scroll position (both directions)
 *   data-clip                 clip-path image reveal (child [data-clip-img] scales)
 *   data-parallax="0.2"       scrubbed vertical drift
 * Reduced-motion users get the final state immediately, with no movement.
 */
export default function ScrollAnimations() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    const setTheme = (name: keyof typeof THEMES, duration: number) =>
      gsap.to(root, { ...THEMES[name], duration, ease: "power2.out", overwrite: "auto" });

    /** Set the colour environment for whatever chapter is on screen right now, instantly (used after page changes). */
    const syncTheme = () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-theme]");
      if (!sections.length) return;
      const probe = window.innerHeight * 0.55;
      const active = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      }) ?? sections[0];
      setTheme(active.dataset.theme as keyof typeof THEMES, 0);
    };
    window.addEventListener("indulgence:theme-sync", syncTheme);

    const bindThemes = (duration: number) => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-theme]");
      if (sections[0]) setTheme(sections[0].dataset.theme as keyof typeof THEMES, 0);
      sections.forEach((s) => {
        ScrollTrigger.create({
          trigger: s,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setTheme(s.dataset.theme as keyof typeof THEMES, duration),
        });
      });
    };

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 1024px)",
      },
      (ctx) => {
        const { reduce, desktop } = ctx.conditions as { reduce: boolean; desktop: boolean };
        bindThemes(reduce ? 0 : 1.1);
        if (reduce) return;

        // Masked word reveals
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          const words = el.querySelectorAll(".w > span");
          gsap.fromTo(
            words,
            { yPercent: 115 },
            {
              yPercent: 0,
              duration: 1.15,
              ease: "power4.out",
              stagger: 0.045,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });

        // Scroll-scrubbed reading emphasis
        gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll(".sw"),
            { opacity: 0.16 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 52%", scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              delay: Number(el.dataset.delay ?? 0),
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
          const img = el.querySelector<HTMLElement>("[data-clip-img]");
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
          tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut" });
          if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "power3.out" }, 0);
        });

        // Line drawings fade up and are wiped in left→right *with the scroll* (scrubbed, so scrolling back up
        // un-draws them). Finished well before the section is centred, so it is complete while being read.
        // Uses opacity + a sliding cover (both compositor-friendly) rather than animating clip-path,
        // which repaints a very large area every frame.
        gsap.utils.toArray<HTMLElement>("[data-scrub-draw]").forEach((el) => {
          const section = el.closest("section") ?? el;
          const cover = el.querySelector<HTMLElement>("[data-draw-cover]");
          if (cover) gsap.set(cover, { display: "block" });
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: section, start: "top 90%", end: "center 65%", scrub: 0.6 },
          });
          tl.fromTo(el, { opacity: 0 }, { opacity: 1 }, 0);
          if (cover) tl.fromTo(cover, { xPercent: 0 }, { xPercent: 101 }, 0);
        });

        gsap.utils.toArray<HTMLElement>("[data-scale]").forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 0.82, yPercent: 6 },
            {
              scale: 1,
              yPercent: -3,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 100%", end: "center 45%", scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amt = Number(el.dataset.parallax) * (desktop ? 1 : 0.5);
          gsap.fromTo(
            el,
            { yPercent: -amt * 50 },
            {
              yPercent: amt * 50,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      },
    );

    // Layout is stable (fixed image dimensions) but fonts can shift it slightly.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("indulgence:theme-sync", syncTheme);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
