"use client";

import { useCart } from "./CartProvider";

/** "Add" pill that turns into a quantity stepper once the item is in the order list. */
export default function AddToOrder({ slug, name, variantLabel }: { slug: string; name: string; variantLabel?: string }) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(slug, variantLabel);
  const label = `${name}${variantLabel ? ` (${variantLabel})` : ""}`;

  if (qty === 0) {
    return (
      <button type="button" onClick={() => add(slug, variantLabel)} className="btn btn-solid !px-5 !py-1.5 !text-[0.8rem]" data-cursor aria-label={`Add ${label} to your order`}>
        Add
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)] text-accent" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => setQty(slug, variantLabel, qty - 1)} className="flex h-8 w-8 items-center justify-center text-lg leading-none" aria-label={`Remove one ${label}`}>
        −
      </button>
      <span className="min-w-5 text-center text-[0.85rem] font-medium" aria-live="polite">{qty}</span>
      <button type="button" onClick={() => add(slug, variantLabel)} className="flex h-8 w-8 items-center justify-center text-lg leading-none" aria-label={`Add another ${label}`}>
        +
      </button>
    </div>
  );
}
