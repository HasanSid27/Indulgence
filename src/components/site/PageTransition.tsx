"use client";

import { createContext, forwardRef, useCallback, useContext, useLayoutEffect, useRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { getLenis, jumpToTarget, scrollToTarget } from "@/lib/lenis";

const Ctx = createContext<(href: string) => void>(() => {});
export const useNavigate = () => useContext(Ctx);

/**
 * Page changes are instant (no colour wipe or blank screen between pages): the new page is shown at once,
 * starting at the top (or at the requested #section), and its content fades up gently.
 * Same-page hash links just smooth-scroll. The fade is skipped for reduced motion.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const pendingHash = useRef<string | null>(null);
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) {
        if (url.hash) scrollToTarget(url.hash);
        else scrollToTarget(0);
        return;
      }
      if (busy.current) return;
      busy.current = true;
      pendingHash.current = url.hash || null;
      // safety net: never stay locked if a navigation doesn't complete
      window.setTimeout(() => (busy.current = false), 5000);
      router.push(url.pathname + url.search);
    },
    [router],
  );

  // Runs after the new page is in the DOM but before it is painted, so there is never a flash of the old
  // scroll position or of the previous page's colour.
  useLayoutEffect(() => {
    if (!busy.current) return;
    window.scrollTo(0, 0);
    getLenis()?.scrollTo(0, { immediate: true });
    const hash = pendingHash.current;
    pendingHash.current = null;
    if (hash) {
      jumpToTarget(hash);
      window.dispatchEvent(new Event("indulgence:theme-sync")); // right colours for where we landed, no fade
      window.setTimeout(() => {
        jumpToTarget(hash); // correct for late layout (images, pinned sections)
        window.dispatchEvent(new Event("indulgence:theme-sync"));
      }, 250);
    }
    const main = document.getElementById("main");
    if (!main || reduce()) {
      busy.current = false;
      return;
    }
    gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out", clearProps: "opacity", onComplete: () => void (busy.current = false) });
  }, [pathname]);

  return <Ctx.Provider value={go}>{children}</Ctx.Provider>;
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Internal link that routes through the page transition. */
export const TransitionLink = forwardRef<HTMLAnchorElement, Props>(function TransitionLink({ href, onClick, ...rest }, ref) {
  const go = useNavigate();
  return (
    <Link
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(href);
      }}
      {...rest}
    />
  );
});
