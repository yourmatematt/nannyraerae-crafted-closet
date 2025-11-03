import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterModal } from "@/components/NewsletterModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  created_at: string;
  badge?: string;
  stock_quantity?: number;
  in_stock?: boolean;
}

const HeaderSection = () => (
  <section className="py-16 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#8E5A3B' }}>
          New Arrivals
        </h1>
        <p className="font-inter text-xl mb-4 text-muted-foreground">
          Discover our latest handcrafted pieces, each one unique and made with love
        </p>
        <p className="font-inter text-lg text-muted-foreground">
          Fresh designs and seasonal favorites just added to our collection
        </p>
      </div>
    </div>
  </section>
);

const NewArrivals = () => {
  const { addToCart, items } = useCart();
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching new arrivals:', error);
        return [
          {
            id: 1,
            name: "Garden Party Dress",
            price: 89,
            image_url: null,
            created_at: new Date().toISOString(),
            badge: "NEW",
            stock_quantity: 3,
            in_stock: true
          },
          {
            id: 2,
            name: "Coastal Dreams Romper",
            price: 65,
            image_url: null,
            created_at: new Date().toISOString(),
            badge: "NEW",
            stock_quantity: null,
            in_stock: true
          },
          {
            id: 3,
            name: "Modern Vintage Pants",
            price: 75,
            image_url: null,
            created_at: new Date().toISOString(),
            badge: null,
            stock_quantity: 1,
            in_stock: true
          }
        ];
      }

      return data as Product[];
    }
  });

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    // Fallback to placeholder images
    const images = [productDress, productRomper, productPants];
    return images[product.id % images.length];
  };

  const getIsNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const daysOld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysOld <= 7;
  };



  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: getProductImage(product),
      description: product.description || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  // Memoized products grid component
  const ProductsGrid = useMemo(() => {
    if (isLoading) {
      return (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (products.length === 0) {
      return (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No new arrivals yet
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for our latest handcrafted pieces!
              </p>
              <Button onClick={() => setShowNewsletterModal(true)}>
                Get Notified About New Arrivals
              </Button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  badge: getIsNew(product.created_at) ? "NEW" : undefined
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }, [products, isLoading]);

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
    )}>
      <SEO
        title="New Arrivals | Latest Handmade Children's Clothing"
        description="Shop the latest handmade children's pieces. New designs added weekly. Australian made with love. Limited edition styles for babies and kids up to 5 years."
        keywords="new arrivals children's clothing, latest kids fashion, handmade baby clothes, new designs, limited edition children's wear"
        canonicalUrl="/new-arrivals"
      />
      <Navigation />

      <HeaderSection />

      {/* Memoized Products Grid */}
      {ProductsGrid}

      

      <Footer />

      <NewsletterModal
        open={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
        onSubscribeSuccess={() => setShowNewsletterModal(false)}
      />
    </div>
  );
};

export default NewArrivals;