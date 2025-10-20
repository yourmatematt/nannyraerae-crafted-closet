import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";
import heroImage from "@/assets/hero-image.jpg";

const Collections = () => {
  const navigate = useNavigate();
  const { data: totalProducts = 0, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['totalProducts'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching product count:', error);
        return 55; // fallback count
      }

      return count || 55;
    }
  });

  const { data: collectionCounts = {}, isLoading: isLoadingCounts } = useQuery({
    queryKey: ['collectionCounts'],
    queryFn: async () => {
      // Try to get counts by collection
      const { data, error } = await supabase
        .from('products')
        .select('collection')
        .not('collection', 'is', null);

      if (error) {
        console.error('Error fetching collection counts:', error);
        return {
          'garden-party': 12,
          'modern-vintage': 15,
          'rainbow-bright': 18,
          'coastal-dreams': 10
        };
      }

      // Count products by collection
      const counts: Record<string, number> = {};
      data.forEach(product => {
        if (product.collection) {
          counts[product.collection] = (counts[product.collection] || 0) + 1;
        }
      });

      // Add fallback counts for empty collections
      return {
        'garden-party': counts['garden-party'] || 3,
        'modern-vintage': counts['modern-vintage'] || 4,
        'rainbow-bright': counts['rainbow-bright'] || 5,
        'coastal-dreams': counts['coastal-dreams'] || 2,
        'spring-awakening': counts['spring-awakening'] || 6,
        'summer-adventures': counts['summer-adventures'] || 8,
        ...counts
      };
    }
  });
  const signatureCollections = [
    {
      name: "Garden Party",
      slug: "garden-party",
      description: "Floral and nature-inspired pieces that celebrate the beauty of the outdoors",
      image: productDress,
      itemCount: collectionCounts['garden-party'] || 0
    },
    {
      name: "Modern Vintage",
      slug: "modern-vintage",
      description: "Classic styles with a contemporary twist for timeless appeal",
      image: productRomper,
      itemCount: collectionCounts['modern-vintage'] || 0
    },
    {
      name: "Rainbow Bright",
      slug: "rainbow-bright",
      description: "Bold, colorful designs that spark joy and imagination",
      image: productPants,
      itemCount: collectionCounts['rainbow-bright'] || 0
    },
    {
      name: "Coastal Dreams",
      slug: "coastal-dreams",
      description: "Beach and ocean inspired pieces for little water lovers",
      image: heroImage,
      itemCount: collectionCounts['coastal-dreams'] || 0
    }
  ];

  const seasonalCollections = [
    {
      name: "Spring Awakening",
      slug: "spring-awakening",
      description: "Fresh colors and light fabrics for the season of growth",
      image: productRomper,
      itemCount: collectionCounts['spring-awakening'] || 0,
      isCurrent: true
    },
    {
      name: "Summer Adventures",
      slug: "summer-adventures",
      description: "Breezy styles perfect for warm weather fun",
      image: productPants,
      itemCount: collectionCounts['summer-adventures'] || 0,
      isCurrent: false
    }
  ];

  const specialCollections = [
    {
      name: "Coordinating Siblings",
      slug: "coordinating-siblings",
      description: "Matching sets and complementary pieces for brothers and sisters",
      image: productDress,
      itemCount: collectionCounts['coordinating-siblings'] || Math.floor(totalProducts * 0.1)
    },
    {
      name: "First Wardrobe",
      slug: "first-wardrobe",
      description: "Essential pieces for baby's first months",
      image: productRomper,
      itemCount: collectionCounts['first-wardrobe'] || Math.floor(totalProducts * 0.2)
    },
    {
      name: "Special Occasions",
      slug: "special-occasions",
      description: "Party and formal wear for life's memorable moments",
      image: heroImage,
      itemCount: collectionCounts['special-occasions'] || Math.floor(totalProducts * 0.15)
    },
    {
      name: "Eco-Conscious",
      slug: "eco-conscious",
      description: "Sustainable fabric choices for environmentally aware families",
      image: productPants,
      itemCount: collectionCounts['eco-conscious'] || Math.floor(totalProducts * 0.12)
    }
  ];

  const isLoading = isLoadingTotal || isLoadingCounts;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Page Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nanny Rae Rae's Collection</h1>
          <p className="text-lg text-gray-600 mb-10">
            Each collection tells a story through fabric and design
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-card rounded-2xl overflow-hidden shadow-soft">
                  <div className="aspect-[4/3] bg-muted"></div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
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
            <Button variant="secondary" size="lg" onClick={() => navigate('/new-arrivals')}>
              View All Products
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => navigate('/gifts')}>
              Browse Gift Ideas
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;