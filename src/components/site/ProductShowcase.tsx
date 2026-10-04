import ProductCard from "./ProductCard";
import { getSiteData } from "@/lib/data";
import { productOrderUrl } from "@/lib/whatsapp";

/** The featured categories' products (brownies by default), one full composition each. id anchors #products. */
export default async function ProductShowcase() {
  const { categories, products, settings } = await getSiteData();
  const featured = categories.filter((c) => c.featured);
  const list = featured.flatMap((c) => products.filter((p) => p.category === c.id).map((p) => ({ p, category: c.name })));
  if (!list.length) return null;
  return (
    <section id="products" aria-label={featured.map((c) => c.name).join(", ")}>
      {list.map(({ p, category }, i) => (
        <ProductCard key={p.slug} product={p} index={i} total={list.length} categoryName={category} orderUrl={productOrderUrl(settings.whatsappNumber, p.name)} />
      ))}
    </section>
  );
}
