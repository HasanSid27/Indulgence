import SplitText from "./SplitText";
import { getSiteData } from "@/lib/data";

export default async function OrderNotes() {
  const { orderNotes } = await getSiteData();
  return (
    <section aria-labelledby="notes-title" className="px-[var(--gutter)] py-[clamp(5rem,10vw,10rem)]">
      <div className="mx-auto grid max-w-[1700px] gap-12 border-t hairline pt-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4 text-accent">Good to know</p>
          <SplitText as="h2" id="notes-title" className="display text-[clamp(1.9rem,3.6vw,3.2rem)] text-accent">
            Important notes.
          </SplitText>
        </div>
        <dl className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:col-span-8">
          {orderNotes.map((n) => (
            <div key={n.title} data-fade>
              <dt className="mb-3 font-semibold text-accent">{n.title}</dt>
              <dd className="muted space-y-3 text-[0.95rem] leading-relaxed">
                {n.lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
