"use client";

import { useEffect, useState } from "react";
import { TransitionLink } from "./PageTransition";
import { useSiteData } from "./DataProvider";

/** Sticky category index with active-section indicator. */
export default function MenuNav() {
  const { categories } = useSiteData();
  const [active, setActive] = useState<string>(categories[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [categories]);

  return (
    <nav
      aria-label="Menu categories"
      className="sticky z-[70] border-y hairline px-[var(--gutter)] backdrop-blur-xl"
      style={{ top: "56px", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
    >
      <ul className="mx-auto flex max-w-[1700px] items-center justify-center gap-2 overflow-x-auto py-3 sm:gap-8" data-lenis-prevent-touch>
        {categories.map((c) => {
          const on = active === c.id;
          return (
            <li key={c.id} className="shrink-0">
              <TransitionLink
                href={`/menu#${c.id}`}
                aria-current={on ? "true" : undefined}
                className={`flex text-[0.85rem] items-center gap-3 px-3 py-2 transition-opacity ${on ? "opacity-100" : "opacity-55 hover:opacity-100"}`}
              >
                                <span className="relative">
                  {c.name}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-px w-full origin-left bg-current transition-transform duration-700"
                    style={{ transform: `scaleX(${on ? 1 : 0})` }}
                  />
                </span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
