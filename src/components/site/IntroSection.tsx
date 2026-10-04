import SplitText from "./SplitText";
import Button from "./Button";
import { generalOrderUrl } from "@/lib/whatsapp";
import { getSiteData } from "@/lib/data";

export default async function IntroSection() {
  const { settings, content } = await getSiteData();
  return (
    <section data-theme="light" aria-labelledby="intro-title" className="relative px-[var(--gutter)] py-[clamp(6rem,13vw,12rem)] text-center">
      <div className="mx-auto max-w-[1100px]">
        <p className="eyebrow mb-6 text-accent" data-fade>The studio</p>
        <h2 id="intro-title" className="display text-[clamp(2.4rem,6.2vw,5.6rem)] text-accent">
          <SplitText className="block">{content.introLine1}</SplitText>
          <SplitText className="block">{content.introLine2}</SplitText>
        </h2>
        <p data-fade className="muted mx-auto mt-8 max-w-[34rem] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed">
          {content.introParagraph}
        </p>
        <div data-fade data-delay="0.15" className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/menu">Explore the menu</Button>
          <Button href={generalOrderUrl(settings.whatsappNumber)} external variant="outline">Order on WhatsApp</Button>
        </div>
      </div>
    </section>
  );
}
