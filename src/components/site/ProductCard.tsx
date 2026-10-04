import ImageReveal from "./ImageReveal";
import SplitText from "./SplitText";
import Button from "./Button";
import { TransitionLink } from "./PageTransition";
import { formatPrice, lowestPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * One product, one screen: centred headline, then the photograph scales up
 * toward you as you scroll. Sections alternate burgundy / paper.
 */
export default function ProductCard({ product, index, total, categoryName, orderUrl }: { product: Product; index: number; total: number; categoryName: string; orderUrl: string }) {
  const dark = index % 2 === 0;
  const from = lowestPrice(product);
  const multi = product.variants.length > 1;

  return (
    <article
      data-theme={dark ? "dark" : "light"}
      aria-labelledby={`p-${product.slug}`}
      className="relative overflow-hidden px-[var(--gutter)] pb-[clamp(6rem,11vw,10rem)] pt-[clamp(6rem,11vw,10rem)] text-center"
    >
      <div className="mx-auto max-w-[900px]">
        <p className="eyebrow mb-5 opacity-80" data-fade>
          {categoryName} · {index + 1} of {total}
        </p>
        <SplitText as="h3" id={`p-${product.slug}`} className="display text-[clamp(2.6rem,7vw,6.2rem)]">
          {product.name}
        </SplitText>
        {product.description && (
          <p data-fade className="muted mx-auto mt-5 max-w-[34rem] text-[clamp(1rem,1.5vw,1.25rem)]">{product.description}</p>
        )}
        {product.notes.length > 0 && (
        <ul data-fade className="muted mx-auto mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[clamp(1rem,1.5vw,1.25rem)]" aria-label="Key ingredients">
          {product.notes.map((note, i) => (
            <li key={note} className="flex items-center gap-3">
              {note}
              {i < product.notes.length - 1 && <span aria-hidden>·</span>}
            </li>
          ))}
        </ul>
        )}
        <p data-fade className="mt-6 text-[clamp(1.05rem,1.6vw,1.35rem)]">
          {multi ? "From " : ""}
          <strong className="font-semibold">{formatPrice(from)}</strong>
          {product.variants.some((v) => v.label) && (
            <span className="muted"> · {product.variants.map((v) => v.label).filter(Boolean).join(" or ")}</span>
          )}
        </p>
        <div data-fade data-delay="0.1" className="mt-8 flex flex-wrap items-center justify-center gap-5">
          <Button href={orderUrl} external ariaLabel={`Order ${product.name} on WhatsApp`}>
            Order on WhatsApp
          </Button>
          <TransitionLink href={`/menu#${product.slug}`} className="link-line text-[0.95rem]">
            See on the menu ›
          </TransitionLink>
        </div>
      </div>

      {product.image && (
        <div
          className="relative mx-auto mt-[clamp(2rem,5vw,4rem)]"
          // Capped near the photo's native resolution so it stays sharp at full zoom.
          style={{ width: `min(88vw, ${Math.round((product.image.width / 2) * 1.1)}px)` }}
        >
          <TransitionLink href={`/menu#${product.slug}`} aria-label={`View ${product.name} on the menu`} className="block" data-cursor>
            <div data-scale className={`relative will-change-transform ${product.image.photo ? "overflow-hidden rounded-[1.75rem] shadow-[0_30px_70px_rgba(0,0,0,0.35)]" : ""}`}>
              <ImageReveal {...product.image} sizes="(min-width:1024px) 700px, 88vw" className={product.image.photo ? "" : "drop-shadow-[0_40px_50px_rgba(0,0,0,0.28)]"} />
            </div>
          </TransitionLink>
        </div>
      )}
    </article>
  );
}
