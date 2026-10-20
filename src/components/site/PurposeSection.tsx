import Image from "next/image";
import SplitText from "./SplitText";
import Button from "./Button";
import { getSiteData } from "@/lib/data";

/** A principle, not a campaign: one centred statement and a single sentence of why. */
export default async function PurposeSection() {
  const { content } = await getSiteData();
  return (
    <section id="purpose" data-theme="dark" aria-labelledby="purpose-title" className="relative overflow-hidden px-[var(--gutter)] py-[clamp(7rem,14vw,13rem)] text-center max-md:pb-[calc(65.4vw+3.5rem)]">
      {/* Mylo & Alexa — line drawing behind the text. It fades up and is "wiped" in left→right by scroll
          position (scrubbed, reversible) and is complete once the section is on screen.
          The artwork is centred on the two cats and its ground line is built into the image, running far
          beyond both screen edges, so there is never a gap at the sides. The cats themselves are shown
          large (≈ one screen wide); the canvas is 3034px wide with the cats occupying 1234px of it.
          On phones the text is too long to sit over the drawing legibly, so it is placed beneath the text instead. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden max-md:items-end max-md:pb-6">
        <div data-scrub-draw className="relative flex w-full justify-center">
          <Image
            src="/brand/cats-outline.png"
            alt="Line drawing of two cats, Mylo and Alexa, sitting close together"
            width={3034}
            height={808}
            sizes="(min-width:1024px) 3442px, 246vw"
            // Served as-is (no palette re-quantising of the thin anti-aliased lines).
            unoptimized
            // Loaded up front, decoded synchronously: a lazily-loaded alpha PNG appearing mid-scroll
            // stalled painting in Chromium during testing.
            loading="eager"
            decoding="sync"
            className="h-auto w-[min(246vw,3442px)] max-w-none shrink-0 select-none opacity-[0.42]"
          />
          {/* Wipe cover: same colour as the page background, slid away by scroll. Hidden unless JS animates it. */}
          <div data-draw-cover aria-hidden className="absolute inset-0 hidden bg-[var(--bg)] will-change-transform" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[980px] [text-shadow:0_0_14px_rgba(141,26,28,0.9)]">
        <p className="eyebrow mb-6 opacity-80" data-fade>Purpose</p>
        <h2 id="purpose-title" className="sr-only">Our purpose</h2>
        <SplitText as="p" className="display text-[clamp(2.4rem,6vw,5.4rem)]">
          {content.purposeLead}
        </SplitText>
        <p data-fade className="mx-auto mt-8 max-w-[32rem] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed" style={{ color: "color-mix(in srgb, var(--fg) 85%, transparent)" }}>
          {/* The cats' names stand out in a warm gold colour (works for any wording from the sheet). */}
          {content.purposeParagraph.split(/(Mylo|Alexa)/i).map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} style={{ color: "#f6cf7a" }}>{part}</span>
            ) : (
              part
            ),
          )}
        </p>
        <div data-fade data-delay="0.1" className="mt-10">
          <Button href="/menu" variant="outline">Explore the menu</Button>
        </div>
      </div>

    </section>
  );
}
