import type Lenis from "lenis";

let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Smooth-scroll to a hash/selector, falling back to native scrolling. */
export function scrollToTarget(target: string | number, offset = 0) {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) return;
    if (instance) instance.scrollTo(el as HTMLElement, { offset, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  } else if (instance) instance.scrollTo(target, { duration: 1.4 });
  else window.scrollTo({ top: target, behavior: "smooth" });
}

/** Jump (no animation) so an element sits at the top of the screen, honouring its scroll-margin. Used right after a page change. */
export function jumpToTarget(target: string) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin);
  if (instance) {
    // Lenis caches the page length; right after a route change it still holds the previous page's, which
    // would clamp the jump. Re-measure first.
    instance.resize();
    instance.scrollTo(y, { immediate: true, force: true });
  } else window.scrollTo(0, y);
}
