"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { getLenis } from "@/lib/lenis";
import { formatPrice } from "@/lib/format";

/** Floating order summary + slide-up sheet. The sheet always uses fixed light colours for legibility. */
export default function CartBar() {
  const { lines, count, total, orderUrl, orderMessage, open, setOpen, setQty, clear } = useCart();
  const sheet = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  /** Fallback for when WhatsApp keeps an old unsent draft in the chat and ignores the prefilled text. */
  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = orderMessage;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      getLenis()?.start();
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (count === 0 && open) setOpen(false);
  }, [count, open, setOpen]);

  return (
    <>
      {count > 0 && !open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[85] flex justify-center px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-solid pointer-events-auto !gap-3 !px-6 !py-3 shadow-[0_12px_40px_rgba(27,13,14,0.35)]"
            style={{ background: "#8d1a1c", color: "#fff", borderColor: "#8d1a1c" }}
            aria-haspopup="dialog"
          >
            <span>{count} {count === 1 ? "item" : "items"} · {formatPrice(total)}</span>
            <span aria-hidden className="opacity-60">|</span>
            <span>View order</span>
          </button>
        </div>
      )}

      <div className={`fixed inset-0 z-[125] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          ref={sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Your order"
          tabIndex={-1}
          className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[88svh] w-full max-w-[560px] flex-col rounded-t-[2rem] bg-[#f6f1eb] p-6 text-[#1b0d0e] outline-none transition-transform duration-500 ease-[var(--ease-out)] sm:bottom-6 sm:rounded-[2rem] ${
            open ? "translate-y-0" : "translate-y-[110%]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-3xl text-[#8d1a1c]">Your order</h2>
            <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-xl" aria-label="Close order list">
              ×
            </button>
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-black/10 overflow-y-auto" data-lenis-prevent>
            {lines.map((l) => (
              <li key={l.product.slug + (l.variantLabel ?? "")} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{l.product.name}</p>
                  <p className="text-sm opacity-65">
                    {l.variantLabel ? `${l.variantLabel} · ` : ""}
                    {formatPrice(l.price)}
                  </p>
                </div>
                <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#8d1a1c] text-[#8d1a1c]">
                  <button type="button" onClick={() => setQty(l.product.slug, l.variantLabel, l.qty - 1)} className="flex h-8 w-8 items-center justify-center text-lg" aria-label={`Remove one ${l.product.name}`}>
                    −
                  </button>
                  <span className="min-w-5 text-center text-[0.85rem] font-medium">{l.qty}</span>
                  <button type="button" onClick={() => setQty(l.product.slug, l.variantLabel, l.qty + 1)} className="flex h-8 w-8 items-center justify-center text-lg" aria-label={`Add another ${l.product.name}`}>
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline justify-between border-t border-black/10 pt-4">
            <span className="opacity-70">Items total</span>
            <span className="display text-2xl text-[#8d1a1c]">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-xs opacity-60">Delivery or pickup is arranged on WhatsApp. Nothing is charged here.</p>

          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#8d1a1c] text-[0.95rem] font-medium text-white"
          >
            Order on WhatsApp
          </a>
          <button
            type="button"
            onClick={copyOrder}
            className="mt-3 flex h-11 items-center justify-center rounded-full border border-[#8d1a1c] text-[0.9rem] font-medium text-[#8d1a1c]"
          >
            {copied ? "Copied ✓ — paste it into the chat" : "Copy order text"}
          </button>
          <p role="status" className="sr-only">{copied ? "Order text copied to the clipboard" : ""}</p>
          <p className="mt-3 text-center text-xs opacity-60">
            WhatsApp keeps an unsent message in a chat as a draft. If your new order doesn’t appear, send or clear the old draft there, or paste the copied text.
          </p>
          <button type="button" onClick={clear} className="mt-3 text-center text-sm opacity-65 underline underline-offset-4">
            Clear order
          </button>
        </div>
      </div>
    </>
  );
}
