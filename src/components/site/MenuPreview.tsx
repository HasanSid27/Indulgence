import Image from "next/image";
import Button from "./Button";
import SplitText from "./SplitText";
import { TransitionLink } from "./PageTransition";
import { formatPrice, lowestPrice, productsIn, startingPrice } from "@/lib/format";
import { getSiteData } from "@/lib/data";

/** One tile per category — a swipeable rail on phones, a row on desktop. */
export default async function MenuPreview() {
  const { categories, products, settings, content } = await getSiteData();
  const cols = Math.min(Math.max(categories.length, 1), 4);
  return (
    <section id="menu" data-theme="light" aria-labelledby="menu-title" className="relative py-[clamp(6rem,12vw,11rem)]">
      <div className="px-[var(--gutter)] text-center">
        <p className="eyebrow mb-6 text-accent" data-fade>The menu</p>
        <SplitText as="h2" id="menu-title" className="display text-[clamp(2.4rem,6.2vw,5.6rem)] text-accent">
          {content.menuPreviewHeading}
        </SplitText>
        <p data-fade className="muted mx-auto mt-6 max-w-md">{content.menuPreviewText}</p>
      </div>

      <ul
        className="mx-auto mt-[clamp(2.5rem,5vw,4.5rem)] flex max-w-[1700px] snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 lg:grid lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] lg:overflow-visible"
        style={{ ["--cols" as string]: cols }}
        data-lenis-prevent-touch
      >
        {categories.map((c, i) => {
          const items = productsIn(products, c.id);
          const lead = items.find((p) => p.image)?.image;
          return (
            <li key={c.id} data-fade data-delay={i * 0.1} className="tile flex w-[82vw] max-w-[460px] shrink-0 snap-center flex-col p-7 sm:w-[60vw] lg:w-auto lg:max-w-none lg:p-9">
              <p className="eyebrow muted">{items.length} flavours</p>
              <h3 className="display mt-2 text-[clamp(2rem,3.4vw,3.2rem)] text-accent">{c.name}</h3>
              <p className="muted mt-1 text-sm">From {formatPrice(startingPrice(products, c.id))}</p>

              {lead ? (
                <div className="relative my-8 flex flex-1 items-center justify-center">
                  <Image
                    src={lead.src}
                    alt={lead.alt}
                    width={lead.width}
                    height={lead.height}
                    sizes="(min-width:1024px) 30vw, 70vw"
                    className={lead.photo ? "h-auto w-[78%] rounded-[1.25rem]" : "h-auto w-[86%] drop-shadow-[0_24px_28px_rgba(27,13,14,0.22)]"}
                  />
                </div>
              ) : (
                <div className="flex-1" />
              )}

              <ul className="divide-y hairline border-t hairline text-[0.95rem]">
                {items.map((p) => (
                  <li key={p.slug} className="flex justify-between gap-4 py-2.5">
                    <span>{p.name}</span>
                    <span className="muted shrink-0">{formatPrice(lowestPrice(p))}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <TransitionLink href={`/menu#${c.id}`} className="link-line text-accent" data-cursor>
                  View {c.name.toLowerCase()} menu ›
                </TransitionLink>
              </p>
            </li>
          );
        })}
      </ul>

      <div data-fade className="mt-12 flex flex-wrap justify-center gap-3 px-[var(--gutter)]">
        <Button href="/menu">Explore the menu</Button>
        <Button href={settings.menuPdfUrl} variant="outline" download external={settings.menuPdfIsExternal}>Download menu PDF</Button>
      </div>
    </section>
  );
}
