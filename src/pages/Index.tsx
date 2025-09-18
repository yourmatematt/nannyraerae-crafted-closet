import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import ValueProps from "@/components/ValueProps";
import ProductShowcase from "@/components/ProductShowcase";
import StorySection from "@/components/StorySection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturedCollections />
        <ValueProps />
        <ProductShowcase />
        <StorySection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
