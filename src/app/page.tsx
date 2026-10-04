import Hero from "@/components/site/Hero";
import IntroSection from "@/components/site/IntroSection";
import BrandStatement from "@/components/site/BrandStatement";
import ProductShowcase from "@/components/site/ProductShowcase";
import PurposeSection from "@/components/site/PurposeSection";
import MenuPreview from "@/components/site/MenuPreview";
import OrderCTA from "@/components/site/OrderCTA";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <IntroSection />
      <BrandStatement />
      <ProductShowcase />
      <PurposeSection />
      <MenuPreview />
      <div data-theme="dark">
        <OrderCTA />
        <Footer />
      </div>
    </>
  );
}
