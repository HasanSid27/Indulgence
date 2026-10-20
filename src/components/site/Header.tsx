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
          // The blur/saturate filter would brighten the burgundy overlay behind the bar into a visible red strip.
          backdropFilter: open ? "none" : undefined,
          WebkitBackdropFilter: open ? "none" : undefined,
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
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full sm:hidden"
              style={{ visibility: open ? "hidden" : "visible" }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .96.98-2.9-.2-.3a8.2 8.2 0 1 1 6.72 3.57Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.13-.56-1.35-.76-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.16 1.75 2.67 4.24 3.74 1.58.68 2.2.74 2.99.62.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
              </svg>
            </a>
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
