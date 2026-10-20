import Image from "next/image";
import SplitText from "./SplitText";
import { formatPrice, lowestPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import AddToOrder from "./AddToOrder";

function MenuItem({ product }: { product: Product }) {
  return (
    <li id={product.slug} className="group scroll-mt-32">
      <article aria-labelledby={`m-${product.slug}`} className="tile flex h-full flex-col p-6 sm:p-8" data-fade>
        {product.image?.photo ? (
          <div className="overflow-hidden rounded-[1.25rem]">
            <Image
              src={product.image.src}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              sizes="(min-width:1024px) 40vw, 90vw"
              loading="lazy"
              className="h-auto w-full transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            />
          </div>
        ) : product.image ? (
          <div className="relative flex aspect-[4/3] items-center justify-center">
            <Image
              src={product.image.src}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              sizes="(min-width:1024px) 40vw, 90vw"
              loading="lazy"
              className="h-auto max-h-[86%] w-auto max-w-[80%] object-contain drop-shadow-[0_24px_26px_rgba(27,13,14,0.22)] transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.06] group-hover:-translate-y-1"
            />
          </div>
        ) : (
          // No photo yet: a quiet placeholder keeps the tile balanced next to its neighbours.
          <div aria-hidden className="relative flex aspect-[4/3] items-center justify-center">
            <div className="aspect-square h-[72%] rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }} />
            <span className="display absolute text-[clamp(4rem,9vw,7rem)] text-accent opacity-25">{product.name.charAt(0)}</span>
          </div>
        )}

        <h3 id={`m-${product.slug}`} className="display mt-4 text-[clamp(1.7rem,2.6vw,2.4rem)] text-accent">{product.name}</h3>
        {product.description && <p className="muted mt-2 text-[0.95rem] leading-relaxed">{product.description}</p>}
        {product.notes.length > 0 && (
          <ul className="muted mt-2 flex flex-wrap gap-x-2 text-[0.92rem]" aria-label="Key ingredients">
            {product.notes.map((n, i) => (
              <li key={n}>{n}{i < product.notes.length - 1 ? " ·" : ""}</li>
            ))}
          </ul>
        )}

        {product.note && <p className="mt-2 text-[0.78rem] leading-snug opacity-70">{product.note}</p>}

        <ul className="mt-6 divide-y hairline border-t hairline">
          {product.variants.map((v) => (
            <li key={v.label ?? "base"} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="flex items-baseline gap-3">
                <span className="display text-[1.5rem] text-accent">{formatPrice(v.price)}</span>
                {v.label && <span className="muted text-sm">{v.label}</span>}
              </div>
              <AddToOrder slug={product.slug} name={product.name} variantLabel={v.label} />
            </li>
          ))}
        </ul>
      </article>
    </li>
  );
}

export default function MenuCategory({ category, items, index }: { category: Category; items: Product[]; index: number }) {
  return (
    <section id={category.id} aria-labelledby={`c-${category.id}`} className="scroll-mt-28 px-[var(--gutter)] pb-[clamp(2rem,4vw,4rem)] pt-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1700px]">
        <header className="mb-10 text-center">
          <p className="eyebrow mb-3 text-accent" data-fade>{items.length} {items.length === 1 ? "flavour" : "flavours"} · from {formatPrice(Math.min(...items.map(lowestPrice)))}</p>
          <SplitText as="h2" id={`c-${category.id}`} className="display text-[clamp(2.6rem,6.4vw,5.6rem)] text-accent">
            {category.name}
          </SplitText>
        </header>
        <ul className={`mx-auto grid gap-4 ${items.length === 1 ? "lg:mx-auto lg:max-w-[560px]" : items.length === 2 || items.length === 4 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
          {items.map((p) => (
            <MenuItem key={p.slug} product={p} />
          ))}
        </ul>
      </div>
      <span className="sr-only">Category {index + 1}</span>
    </section>
  );
}
