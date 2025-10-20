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
  age_group?: string;
  sizes?: string[];
  badge?: string;
  is_popular?: boolean;
}

const ShopByAge = () => {
  const { ageGroup } = useParams();
  const { addToCart } = useCart();
  
  const ageData = {
    "3mths": {
      title: "3 Months",
      description: "Perfectly sized for your precious little one",
      hero: "Soft, gentle fabrics for baby's delicate skin",
      advice: "Easy-dress designs with snap closures for quick diaper changes"
    },
    "6mths": {
      title: "6 Months",
      description: "Growing and exploring in comfort",
      hero: "Durable designs for active babies",
      advice: "Stretchy fabrics that move with your baby's development"
    },
    "9mths": {
      title: "9 Months",
      description: "Mobile babies need comfortable clothes",
      hero: "Crawling-friendly designs that stay in place",
      advice: "Reinforced knees and flexible fits for active exploration"
    },
    "1yr": {
      title: "1 Year",
      description: "Perfect for little adventurers",
      hero: "Easy-dress designs for active toddlers",
      advice: "Independent dressing features with simple closures"
    },
    "2yrs": {
      title: "2 Years",
      description: "For confident little walkers",
      hero: "Durable designs for playground adventures",
      advice: "Easy-care fabrics that handle spills and messes"
    },
    "3yrs": {
      title: "3 Years",
      description: "Ready for preschool and play",
      hero: "Comfortable styles for all-day wear",
      advice: "Machine washable designs that handle playground adventures"
    },
    "4yrs": {
      title: "4 Years",
      description: "Independent dressers need practical styles",
      hero: "Self-dressing friendly designs",
      advice: "Easy fasteners and comfortable fits for growing independence"
    },
    "5yrs": {
      title: "5 Years",
      description: "Stylish pieces for confident kids",
      hero: "Fashion-forward designs kids love to wear",
      advice: "Age-appropriate styles with quality that lasts"
    }
  };

  const currentAge = ageData[ageGroup as keyof typeof ageData] || ageData["1yr"];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productsByAge', ageGroup],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('age_group', ageGroup)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by age:', error);
        return [
          {
            id: 1,
            name: "Garden Party Dress",
            price: 89,
            image_url: null,
            age_group: ageGroup,
            sizes: ["12m", "18m", "2T"],
            is_popular: true
          },
          {
            id: 2,
            name: "Coastal Dreams Romper",
            price: 65,
            image_url: null,
            age_group: ageGroup,
            sizes: ["12m", "18m"],
            is_popular: false
          },
          {
            id: 3,
            name: "Modern Vintage Pants",
            price: 75,
            image_url: null,
            age_group: ageGroup,
            sizes: ["18m", "2T", "3T"],
            is_popular: true
          }
        ];
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

  const categories = [
    { name: "Everyday Essentials", count: 24, image: "/src/assets/product-dress.jpg" },
    { name: "Special Occasion", count: 12, image: "/src/assets/product-romper.jpg" },
    { name: "Seasonal Favorites", count: 18, image: "/src/assets/product-pants.jpg" },
    { name: "Complete Outfits", count: 8, image: "/src/assets/product-dress.jpg" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Age-Specific Hero */}
      <section className="bg-gradient-hero py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-6">
              {currentAge.title}
            </h1>
            <p className="font-inter text-xl mb-4 opacity-90">
              {currentAge.description}
            </p>
            <p className="font-inter text-lg opacity-80">
              {currentAge.hero}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Category Links */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.name} className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-inter font-semibold text-foreground mb-2">{category.name}</h3>
                  <p className="font-inter text-sm text-muted-foreground mb-4">{category.count} items</p>
                  <Button variant="outline" size="sm" className="w-full">Shop Now</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Helpful Content Block */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <h2 className="font-playfair text-2xl font-bold text-center text-foreground mb-6">
              Shopping for a {currentAge.title.split(' ')[0]}?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-inter font-semibold text-foreground mb-3">Size Guide</h3>
                <p className="font-inter text-muted-foreground mb-4">
                  Our {currentAge.title.toLowerCase()} pieces are designed for comfort and growth.
                </p>
                <Button variant="outline" size="sm">View Size Chart</Button>
              </div>
              <div>
                <h3 className="font-inter font-semibold text-foreground mb-3">Perfect For This Age</h3>
                <p className="font-inter text-muted-foreground">
                  {currentAge.advice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Popular for This Age
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-card rounded-xl p-4 shadow-soft">
                  <div className="aspect-[3/4] bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-24"></div>
                  <div className="h-6 bg-muted rounded mb-3 w-20"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="font-playfair text-2xl text-muted-foreground mb-4">No products yet for this age group</h3>
              <p className="font-inter text-muted-foreground mb-6">Check back soon for new arrivals!</p>
              <Button variant="outline" onClick={() => window.location.href = '/new-arrivals'}>View All New Arrivals</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    badge: product.is_popular ? "Popular" : undefined,
                    description: `Available in: ${product.sizes?.join(", ") || "Various sizes"}`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Builder */}
      <section className="py-16 bg-gradient-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-6">
            Why Nanny Rae Rae Understands {currentAge.title.split(' ')[0]}s
          </h2>
          <p className="font-inter text-lg text-white/90 mb-8">
            With years of experience making clothes for my own grandchildren, I understand exactly what works for this age group. Every design is tested by real kids in real situations.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👶</span>
              </div>
              <h3 className="font-inter font-semibold text-white mb-2">Age-Appropriate</h3>
              <p className="font-inter text-sm text-white/80">Designed specifically for this developmental stage</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">✋</span>
              </div>
              <h3 className="font-inter font-semibold text-white mb-2">Safety First</h3>
              <p className="font-inter text-sm text-white/80">All closures and details meet safety standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="font-inter font-semibold text-white mb-2">Comfort Guaranteed</h3>
              <p className="font-inter text-sm text-white/80">Soft, breathable fabrics that feel amazing</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopByAge;