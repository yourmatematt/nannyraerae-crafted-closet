import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import ValueProps from "@/components/ValueProps";
import ProductShowcase from "@/components/ProductShowcase";
import StorySection from "@/components/StorySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
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
