import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Geometric color block - inspired by Kite Clothing */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-brand-coral/90 rounded-2xl rotate-12 hidden lg:block"></div>
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-brand-mustard/90 rounded-full hidden lg:block"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Modern Handmade Fashion for Little Ones
        </h1>
        
        <p className="font-inter text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Each piece crafted with love by Nanny Rae Rae. Exclusive designs that blend modern style with traditional craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-inter font-semibold px-8 py-4 text-lg rounded-full shadow-large"
          >
            SHOP NEW COLLECTION
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-white text-white hover:bg-white hover:text-primary font-inter font-semibold px-8 py-4 text-lg rounded-full"
          >
            Our Story
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80 text-sm font-inter">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-coral rounded-full"></span>
            <span>Australian Made</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-mustard rounded-full"></span>
            <span>Limited Edition Designs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-sky rounded-full"></span>
            <span>Premium Organic Fabrics</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;