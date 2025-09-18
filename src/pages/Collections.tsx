import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Collections = () => {
  const signatureCollections = [
    {
      name: "Garden Party",
      slug: "garden-party",
      description: "Floral and nature-inspired pieces that celebrate the beauty of the outdoors",
      image: "/src/assets/product-dress.jpg",
      itemCount: 12
    },
    {
      name: "Modern Vintage",
      slug: "modern-vintage",
      description: "Classic styles with a contemporary twist for timeless appeal",
      image: "/src/assets/product-romper.jpg",
      itemCount: 15
    },
    {
      name: "Rainbow Bright",
      slug: "rainbow-bright",
      description: "Bold, colorful designs that spark joy and imagination",
      image: "/src/assets/product-pants.jpg",
      itemCount: 18
    },
    {
      name: "Coastal Dreams",
      slug: "coastal-dreams",
      description: "Beach and ocean inspired pieces for little water lovers",
      image: "/src/assets/product-dress.jpg",
      itemCount: 10
    }
  ];

  const seasonalCollections = [
    {
      name: "Spring Awakening",
      slug: "spring-awakening",
      description: "Fresh colors and light fabrics for the season of growth",
      image: "/src/assets/product-romper.jpg",
      itemCount: 14,
      isCurrent: true
    },
    {
      name: "Summer Adventures",
      slug: "summer-adventures",
      description: "Breezy styles perfect for warm weather fun",
      image: "/src/assets/product-pants.jpg",
      itemCount: 20,
      isCurrent: false
    }
  ];

  const specialCollections = [
    {
      name: "Coordinating Siblings",
      slug: "coordinating-siblings",
      description: "Matching sets and complementary pieces for brothers and sisters",
      image: "/src/assets/product-dress.jpg",
      itemCount: 8
    },
    {
      name: "First Wardrobe",
      slug: "first-wardrobe",
      description: "Essential pieces for baby's first months",
      image: "/src/assets/product-romper.jpg",
      itemCount: 16
    },
    {
      name: "Special Occasions",
      slug: "special-occasions",
      description: "Party and formal wear for life's memorable moments",
      image: "/src/assets/product-pants.jpg",
      itemCount: 12
    },
    {
      name: "Eco-Conscious",
      slug: "eco-conscious",
      description: "Sustainable fabric choices for environmentally aware families",
      image: "/src/assets/product-dress.jpg",
      itemCount: 9
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
            Curated Collections
          </h1>
          <p className="font-inter text-xl text-white/90">
            Each collection tells a story through fabric and design
          </p>
        </div>
      </section>

      {/* Signature Collections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Signature Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {signatureCollections.map((collection) => (
              <Link 
                key={collection.slug} 
                to={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="font-playfair text-2xl font-bold mb-2">{collection.name}</h3>
                      <p className="font-inter text-sm opacity-90 mb-3 line-clamp-2">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-sm">{collection.itemCount} pieces</span>
                        <Button variant="secondary" size="sm">
                          Shop Collection
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Collections */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Seasonal Collections
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {seasonalCollections.map((collection) => (
              <Link 
                key={collection.slug} 
                to={`/collections/${collection.slug}`}
                className="group block relative"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300">
                  {collection.isCurrent && (
                    <div className="absolute top-4 right-4 z-10 bg-brand-coral text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Current Season
                    </div>
                  )}
                  <div className="aspect-[5/3] bg-muted relative overflow-hidden">
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex items-center">
                      <div className="p-8 text-white max-w-md">
                        <h3 className="font-playfair text-3xl font-bold mb-3">{collection.name}</h3>
                        <p className="font-inter mb-4 opacity-90">{collection.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="font-inter text-sm">{collection.itemCount} pieces</span>
                          <Button variant="secondary">
                            Shop Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Collections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Special Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialCollections.map((collection) => (
              <Link 
                key={collection.slug} 
                to={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200">
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-inter font-semibold text-foreground mb-2">{collection.name}</h3>
                    <p className="font-inter text-sm text-muted-foreground mb-3 line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-xs text-muted-foreground">
                        {collection.itemCount} pieces
                      </span>
                      <Button variant="outline" size="sm">
                        Explore
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-primary-foreground mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="font-inter text-lg text-primary-foreground/90 mb-8">
            Every piece is made with love and attention to detail. Browse all our creations or get in touch for something special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              View All Products
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Contact Nanny Rae Rae
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;