import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import ValueProps from "@/components/ValueProps";
import ProductShowcase from "@/components/ProductShowcase";
import StorySection from "@/components/StorySection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const Index = () => {
  const { items } = useCart();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Handmade by Nanny Rae Rae",
    "description": "Australian handmade children's clothing and accessories, lovingly crafted with attention to detail and comfort.",
    "url": "https://bynannyraerae.com.au",
    "logo": "https://kqshrevhtrusxrwkgdmd.supabase.co/storage/v1/object/public/brand-assets/about-rae/nanny-rae-rae-og-image.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "areaServed": "AU",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://www.instagram.com/handmadebynannyraerae",
      "https://www.facebook.com/handmadebynannyraerae"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AU"
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 font-inter",
      items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
    )}>
      <SEO
        title="Handmade Children's Clothing | Australian Made by Nanny Rae Rae"
        description="Discover unique, handcrafted children's clothing made in Australia. Quality pieces lovingly sewn by Nanny Rae Rae. Shop exclusive designs for babies and kids."
        keywords="handmade children's clothing, Australian made kids clothes, handcrafted baby wear, unique children's fashion, sustainable kids clothing, baby clothes Australia"
        canonicalUrl="/"
        structuredData={structuredData}
      />
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
