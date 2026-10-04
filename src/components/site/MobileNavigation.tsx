"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { TransitionLink } from "./PageTransition";
import { navLinks } from "./nav";
import { getLenis } from "@/lib/lenis";
import { generalOrderUrl } from "@/lib/whatsapp";
import { useSiteData } from "./DataProvider";

/** Full-screen burgundy overlay navigation with staggered type. */
export default function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useSiteData();
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = root.current!;
    const items = el.querySelectorAll("[data-item]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (first.current) {
      first.current = false;
      gsap.set(el, { clipPath: "inset(0 0 100% 0)", visibility: "hidden" });
      return;
    }
    if (open) {
      getLenis()?.stop();
      document.documentElement.style.overflow = "hidden";
      gsap.set(el, { visibility: "visible" });
      gsap.to(el, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.9, ease: "power4.inOut" });
      if (!reduce) gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.06, delay: 0.35 });
      (el.querySelector("a") as HTMLElement | null)?.focus();
    } else {
      getLenis()?.start();
      document.documentElement.style.overflow = "";
      gsap.to(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: reduce ? 0 : 0.3,
        ease: "power4.inOut",
        onComplete: () => void gsap.set(el, { visibility: "hidden" }),
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={root}
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col justify-between bg-burgundy px-[var(--gutter)] pb-8 pt-28 text-paper lg:hidden"
      style={{ visibility: "hidden" }}
    >
      <nav aria-label="Mobile">
        <ul className="flex flex-col gap-1">
          {navLinks.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <div data-item className="flex items-baseline gap-4">
                <span className="eyebrow w-6 opacity-60" aria-hidden>0{i + 1}</span>
                <TransitionLink
                  href={l.href}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  className="display block py-1 text-[clamp(2.24rem,10.4vw,3.68rem)]"
                >
                  {l.label}
                </TransitionLink>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-5">
        <a
          href={generalOrderUrl(settings.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
          className="flex h-14 items-center justify-center bg-white text-[0.78rem] font-medium uppercase tracking-[0.16em] text-burgundy"
        >
          Order on WhatsApp
        </a>
        <div className="eyebrow flex items-center justify-between opacity-80">
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
            Instagram
          </a>
          <a href={`tel:+${settings.whatsappNumber}`} tabIndex={open ? 0 : -1}>{settings.phoneDisplay}</a>
        </div>
      </div>
    </div>
  );
}
