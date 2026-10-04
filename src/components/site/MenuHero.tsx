import SplitText from "./SplitText";
import Button from "./Button";
import { generalOrderUrl } from "@/lib/whatsapp";
import { getSiteData } from "@/lib/data";

export default async function MenuHero() {
  const { settings, content, products } = await getSiteData();
  return (
    <section data-theme="light" aria-labelledby="menu-page-title" className="px-[var(--gutter)] pb-[clamp(2rem,5vw,4rem)] pt-[clamp(8rem,13vw,12rem)] text-center">
      <div className="mx-auto max-w-[1000px]">
        <p className="eyebrow mb-5 text-accent" data-fade>{products.length} flavours · made to order</p>
        <SplitText as="h1" id="menu-page-title" className="display text-[clamp(3.2rem,9vw,8rem)] text-accent">
          The Menu.
        </SplitText>
        <p data-fade className="muted mx-auto mt-6 max-w-md text-lg">{content.menuIntro}</p>
        <div data-fade className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={settings.menuPdfUrl} download external={settings.menuPdfIsExternal}>Download menu PDF</Button>
          <Button href={generalOrderUrl(settings.whatsappNumber)} external variant="outline">Order on WhatsApp</Button>
        </div>
      </div>
    </section>
  );
}
