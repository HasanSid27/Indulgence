"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "./PageTransition";
import Wordmark from "./Wordmark";
import MobileNavigation from "./MobileNavigation";
import { navLinks } from "./nav";
import { generalOrderUrl } from "@/lib/whatsapp";
import { useSiteData } from "./DataProvider";

/**
 * Floating header. Colours come from the page's live CSS variables, so it
 * inverts smoothly as the background moves between paper and burgundy.
 * Hides on scroll-down, returns on scroll-up.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { settings } = useSiteData();
  const orderUrl = generalOrderUrl(settings.whatsappNumber);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[90] backdrop-blur-xl backdrop-saturate-150"
        style={{
          color: open ? "#f6f1eb" : "var(--fg)",
          background: open ? "transparent" : "color-mix(in srgb, var(--bg) 72%, transparent)",
          borderBottom: open ? "none" : "1px solid color-mix(in srgb, var(--fg) 10%, transparent)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1700px] items-center justify-between px-[var(--gutter)]">
          <TransitionLink href="/" aria-label="iNdulgence — home" className="block w-[88px] md:w-[100px]" data-cursor>
            <Wordmark />
          </TransitionLink>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {navLinks.filter((l) => l.label !== "Home" && l.label !== "Contact").map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                aria-current={l.href === pathname ? "page" : undefined}
                className="link-line text-[0.82rem] opacity-80 transition-opacity hover:opacity-100"
              >
                {l.label}
              </TransitionLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <TransitionLink href="/menu" className="link-line hidden text-[0.82rem] xl:inline-block">
              View Menu
            </TransitionLink>
            {/* Wrapper hides it on phones: .btn sets display and would override a `hidden` class on the link itself. */}
            <div className="hidden sm:block">
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-solid !px-4 !py-1.5 !text-[0.8rem]"
                data-cursor
              >
                <span>Order on WhatsApp</span>
              </a>
            </div>
            <button
              type="button"
              className="eyebrow relative z-[95] flex h-11 items-center gap-3 pl-2 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((o) => !o)}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span aria-hidden className="relative block h-[9px] w-6">
                <span className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "top-1 -rotate-45" : "top-[8px]"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MobileNavigation open={open} onClose={() => setOpen(false)} />
    </>
  );
}
