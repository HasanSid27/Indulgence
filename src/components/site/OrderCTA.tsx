import SplitText from "./SplitText";
import Button from "./Button";
import { generalOrderUrl } from "@/lib/whatsapp";
import { getSiteData } from "@/lib/data";

/** Final composition: one line, one action. */
export default async function OrderCTA() {
  const { settings, content } = await getSiteData();
  return (
    <section id="order" aria-labelledby="order-title" className="relative px-[var(--gutter)] pb-[clamp(4rem,8vw,7rem)] pt-[clamp(7rem,14vw,13rem)] text-center">
      <div className="mx-auto max-w-[1100px]">
        <SplitText as="h2" id="order-title" className="display text-[clamp(2.8rem,8.4vw,8rem)]">
          {content.finalHeadline}
        </SplitText>
        <div data-fade className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={generalOrderUrl(settings.whatsappNumber)} external>Order on WhatsApp</Button>
          <Button href="/menu" variant="outline">View menu</Button>
          <Button href={settings.menuPdfUrl} variant="outline" download external={settings.menuPdfIsExternal}>Download PDF</Button>
        </div>
        <p data-fade className="mt-10 text-sm opacity-75">
          {content.finalNote}
        </p>
      </div>
    </section>
  );
}
