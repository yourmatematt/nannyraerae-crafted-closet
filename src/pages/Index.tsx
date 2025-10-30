import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import ValueProps from "@/components/ValueProps";
import ProductShowcase from "@/components/ProductShowcase";
import StorySection from "@/components/StorySection";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const Index = () => {
  const { items } = useCart();

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 font-inter",
      items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
    )}>
      <Navigation />
      <main>
        <HeroSection />
        <NewArrivalsSection />
        <StorySection />
        <FeaturedCollections />
        <ValueProps />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
