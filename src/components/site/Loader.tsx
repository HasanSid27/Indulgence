"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Wordmark from "./Wordmark";

/** Short (~1.4s) opening sequence. Shown once per session. Dispatches "indulgence:ready". */
export default function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const ready = () => {
      document.documentElement.dataset.ready = "true";
      window.dispatchEvent(new Event("indulgence:ready"));
      setDone(true);
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem("indulgence-loaded") === "1";
      sessionStorage.setItem("indulgence-loaded", "1");
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      ready();
      return;
    }

    const el = ref.current!;
    const mark = el.querySelector(".mark");
    const tl = gsap.timeline({ onComplete: ready });
    tl.fromTo(mark, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out" })
      .to({}, { duration: 0.35 })
      .to(el, { yPercent: -100, duration: 0.9, ease: "power4.inOut" });
    return () => {
      tl.kill();
    };
  }, []);

  if (done) return null;
  return (
    <div ref={ref} data-loader aria-hidden className="fixed inset-0 z-[150] flex items-center justify-center bg-burgundy text-white">
      <div className="mark w-[min(62vw,420px)] opacity-0">
        <Wordmark label={false} />
      </div>
      <noscript>
        <style>{`[data-loader]{display:none!important}`}</style>
      </noscript>
    </div>
  );
}
