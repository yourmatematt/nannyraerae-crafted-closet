import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";
import heroImage from "@/assets/hero-image.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  badge?: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  sizes: string[];
  inStock: boolean;
}

interface SupabaseProduct {
  id: number;
  name: string;
  price: number;
  original_price?: number | null;
  image_url?: string;
  badge?: string;
  badge_variant?: "default" | "secondary" | "destructive" | "outline";
  sizes?: string[];
  in_stock?: boolean;
}

const ProductShowcase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4);

      if (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data if Supabase fails
        setProducts([
          {
            id: 1,
            name: "Garden Bloom Dress",
            price: 89,
            originalPrice: null,
            image: productDress,
            badge: "New Arrival",
            badgeVariant: "default" as const,
            sizes: ["6m", "12m", "18m", "2T"],
            inStock: true,
          },
          {
            id: 2,
            name: "Woodland Explorer Romper",
            price: 65,
            originalPrice: null,
            image: productRomper,
            badge: "Best Seller",
            badgeVariant: "secondary" as const,
            sizes: ["3m", "6m", "12m", "18m"],
            inStock: true,
          },
          {
            id: 3,
            name: "Adventure Pants",
            price: 55,
            originalPrice: 75,
            image: productPants,
            badge: "Only 2 Left",
            badgeVariant: "destructive" as const,
            sizes: ["12m", "18m", "2T"],
            inStock: true,
          },
          {
            id: 4,
            name: "Sunday Best Set",
            price: 125,
            originalPrice: null,
            image: productDress,
            badge: "Limited Edition",
            badgeVariant: "outline" as const,
            sizes: ["18m", "2T", "3T"],
            inStock: false,
          },
        ]);
      } else {
        // Map Supabase data to component format with better placeholder images
        const placeholderImages = [productDress, productRomper, productPants, heroImage];
        const mappedProducts = data.map((product: SupabaseProduct, index) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          image: product.image_url || placeholderImages[index % placeholderImages.length],
          badge: product.badge,
          badgeVariant: (product.badge_variant || "default") as "default" | "secondary" | "destructive" | "outline",
          sizes: product.sizes || [],
          inStock: product.in_stock ?? true,
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    // Fallback to placeholder images
    const images = [productDress, productRomper, productPants, heroImage];
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

  if (loading) {
    return (
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#8E5A3B' }}>
            Nanny Rae Rae's Picks
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked favorites from our latest collection
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-soft animate-pulse">
              <div className="aspect-square bg-muted"></div>
              <div className="p-6">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-3 w-20"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded w-8"></div>
                  <div className="h-6 bg-muted rounded w-8"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-playfair text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#8E5A3B' }}>
          Nanny Rae Rae's Picks
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Handpicked favorites from our latest collection
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image,
              badge: product.badge,
              in_stock: product.inStock,
              description: `Available in: ${product.sizes.join(", ")}`,
              stock: product.inStock ? 10 : 0, // Fallback stock value
            }}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-12">
        <Button
          size="lg"
          variant="outline"
          className="font-inter font-semibold px-8 py-4 text-lg rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
          View All Products
        </Button>
      </div>
    </section>
  );
};

export default ProductShowcase;