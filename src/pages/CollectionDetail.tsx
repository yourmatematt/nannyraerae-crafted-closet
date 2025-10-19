import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  collection?: string;
  colors?: string[];
}

const CollectionDetail = () => {
  const { collectionName } = useParams();
  const { addToCart } = useCart();
  
  const collectionData = {
    "garden-party": {
      name: "Garden Party",
      description: "Celebrate the beauty of nature with our Garden Party collection. Each piece is inspired by blooming flowers, gentle breezes, and sunny afternoons spent outdoors.",
      story: "This collection was born from watching my granddaughter play in her grandmother's garden. She would pick flowers, chase butterflies, and spin until her dress flowed like petals in the wind. I wanted to capture that magical feeling of childhood wonder and nature's beauty in every stitch.",
      colors: ["#F8BBD9", "#E3F2FD", "#C8E6C9", "#FFF9C4"],
      hero: "/src/assets/product-dress.jpg"
    },
    "modern-vintage": {
      name: "Modern Vintage",
      description: "Where timeless elegance meets contemporary style. Our Modern Vintage collection reimagines classic silhouettes with fresh details and modern comfort.",
      story: "Inspired by the beautiful clothes my own mother made for me as a child, this collection honors traditional craftsmanship while embracing today's lifestyle needs. Each piece tells a story of generational love.",
      colors: ["#D7CCC8", "#BCAAA4", "#8D6E63", "#5D4037"],
      hero: "/src/assets/product-romper.jpg"
    }
  };

  const currentCollection = collectionData[collectionName as keyof typeof collectionData] || collectionData["garden-party"];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['collectionProducts', collectionName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('collection', collectionName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching collection products:', error);
        // Fallback to showing all products
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('*')
          .limit(6)
          .order('created_at', { ascending: false });

        if (allError) {
          return [
            {
              id: 1,
              name: "Blooming Dress",
              price: 89,
              image_url: null,
              collection: collectionName,
              colors: ["Pink", "Blue", "Green"]
            },
            {
              id: 2,
              name: "Petal Romper",
              price: 65,
              image_url: null,
              collection: collectionName,
              colors: ["White", "Yellow"]
            },
            {
              id: 3,
              name: "Garden Pants",
              price: 75,
              image_url: null,
              collection: collectionName,
              colors: ["Green", "Pink"]
            }
          ];
        }

        return allProducts as Product[];
      }

      return data as Product[];
    }
  });

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    const images = [productDress, productRomper, productPants];
    return images[product.id % images.length];
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: getProductImage(product),
    });
    toast.success(`${product.name} added to cart!`);
  };

  const stylingTips = [
    {
      title: "Mix & Match Magic",
      description: "Pair the Blooming Dress with Garden Pants for a playful layered look"
    },
    {
      title: "Occasion Perfect",
      description: "Add the Petal Romper for garden parties and outdoor celebrations"
    },
    {
      title: "Seasonal Styling",
      description: "Layer pieces for year-round wear in any climate"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="aspect-[21/9] bg-muted overflow-hidden">
          <img 
            src={currentCollection.hero} 
            alt={currentCollection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl text-white">
              <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-6">
                {currentCollection.name}
              </h1>
              <p className="font-inter text-xl mb-8 opacity-90">
                {currentCollection.description}
              </p>
              <Button size="lg" variant="secondary">
                Shop This Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-foreground mb-6">
              The Story Behind {currentCollection.name}
            </h2>
            <p className="font-inter text-lg text-muted-foreground leading-relaxed">
              {currentCollection.story}
            </p>
          </div>
          
          {/* Color Palette */}
          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <h3 className="font-playfair text-xl font-bold text-center text-foreground mb-6">
              Collection Color Palette
            </h3>
            <div className="flex justify-center items-center gap-4">
              {currentCollection.colors.map((color, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full shadow-medium mx-auto mb-2"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="font-inter text-xs text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Collection Pieces
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  description: `Available in: ${product.colors?.join(", ") || "Multiple colors"}`,
                  image_url: getProductImage(product)
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Complete the Look */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Complete the Look
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {stylingTips.map((tip, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-3">{tip.title}</h3>
                <p className="font-inter text-muted-foreground">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mix and Match Guide */}
      <section className="py-16 bg-gradient-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-6">
            Mix & Match Styling Guide
          </h2>
          <p className="font-inter text-lg text-white/90 mb-8">
            Every piece in the {currentCollection.name} collection is designed to work beautifully together. Create endless outfit combinations for your little one.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="font-inter font-semibold text-white mb-3">Everyday Styling</h3>
              <p className="font-inter text-sm text-white/80">
                Mix casual pieces for comfortable daily wear that still looks special
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="font-inter font-semibold text-white mb-3">Special Occasions</h3>
              <p className="font-inter text-sm text-white/80">
                Layer pieces for parties and celebrations with photo-perfect results
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollectionDetail;