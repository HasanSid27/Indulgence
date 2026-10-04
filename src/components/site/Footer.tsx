import { TransitionLink } from "./PageTransition";
import Wordmark from "./Wordmark";
import { navLinks } from "./nav";
import { generalOrderUrl } from "@/lib/whatsapp";
import { getSiteData } from "@/lib/data";

export default async function Footer() {
  const { settings, content } = await getSiteData();
  return (
    <footer className="relative px-[var(--gutter)] pb-8 pt-[clamp(3rem,6vw,5rem)] text-[0.82rem]">
      <div className="mx-auto max-w-[1700px] border-t hairline pt-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark className="w-[120px]" />
            <p className="mt-5 max-w-xs opacity-80">{content.heroTagline}</p>
          </div>

          <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
            <p className="mb-4 font-semibold">Navigate</p>
            <ul className="space-y-2.5 opacity-80">
              {navLinks.map((l) => (
                <li key={l.href}><TransitionLink href={l.href} className="link-line">{l.label}</TransitionLink></li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="mb-4 font-semibold">Order</p>
            <ul className="space-y-2.5 opacity-80">
              <li><a href={generalOrderUrl(settings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="link-line">Order on WhatsApp</a></li>
              <li><TransitionLink href="/menu" className="link-line">Full menu</TransitionLink></li>
              <li><a href={settings.menuPdfUrl} download{...(settings.menuPdfIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="link-line">Menu PDF</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="mb-4 font-semibold">Contact</p>
            <ul className="space-y-2.5 opacity-80">
              <li><a href={`tel:+${settings.whatsappNumber}`} className="link-line">{settings.phoneDisplay}</a></li>
              <li><a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="link-line">Instagram @{settings.instagramHandle}</a></li>
              <li>{settings.address ?? `${settings.city}, ${settings.region}`}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t hairline pt-6 text-[0.75rem] opacity-70 sm:flex-row">
          <p>© {new Date().getFullYear()} iNdulgence. All rights reserved.</p>
          <p>{content.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
