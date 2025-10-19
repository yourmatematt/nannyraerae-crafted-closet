import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterModal } from "@/components/NewsletterModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Package } from "lucide-react";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  created_at: string;
  badge?: string;
  stock_quantity?: number;
  in_stock?: boolean;
}

// Memoized filter section to prevent unnecessary re-renders
const FilterSection = memo(({
  selectedCategory,
  selectedAgeGroup,
  selectedPriceRange,
  categories,
  productCount,
  onCategoryChange,
  onAgeGroupChange,
  onPriceRangeChange
}: {
  selectedCategory: string;
  selectedAgeGroup: string;
  selectedPriceRange: string;
  categories: string[];
  productCount: number;
  onCategoryChange: (value: string) => void;
  onAgeGroupChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
}) => (
  <section className="py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h1>
      <p className="text-lg text-gray-600 mb-10">
        Discover our latest handcrafted pieces, each one unique and made with love.
      </p>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAgeGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Age Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="0-3m">3 months</SelectItem>
              <SelectItem value="3-12m">6 months</SelectItem>
              <SelectItem value="1-3y">9 months</SelectItem>
              <SelectItem value="3-5y">1 year</SelectItem>
              <SelectItem value="5-10y">2 year</SelectItem>
              <SelectItem value="5-10y">3 year</SelectItem>
              <SelectItem value="5-10y">4 year</SelectItem>
              <SelectItem value="5-10y">2 year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriceRange} onValueChange={onPriceRangeChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under50">Under $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-150">$100 - $150</SelectItem>
              <SelectItem value="150plus">Over $150</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{productCount}</span> products
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price Low-High</SelectItem>
              <SelectItem value="price-high">Price High-Low</SelectItem>
              <SelectItem value="best-selling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </section>
));

FilterSection.displayName = 'FilterSection';

const NewArrivals = () => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const handleAgeGroupChange = useCallback((value: string) => {
    setSelectedAgeGroup(value);
  }, []);

  const handlePriceRangeChange = useCallback((value: string) => {
    setSelectedPriceRange(value);
  }, []);

  // Reset all filters function
  const resetFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedAgeGroup('all');
    setSelectedPriceRange('all');
  }, []);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['newArrivals', selectedCategory, selectedAgeGroup, selectedPriceRange],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('product_type', selectedCategory);
      }

      // Apply age group filter
      if (selectedAgeGroup !== 'all') {
        query = query.eq('age_group', selectedAgeGroup);
      }

      // Apply price range filter
      if (selectedPriceRange === 'under50') {
        query = query.lt('price', 50);
      } else if (selectedPriceRange === '50-100') {
        query = query.gte('price', 50).lt('price', 100);
      } else if (selectedPriceRange === '100-150') {
        query = query.gte('price', 100).lt('price', 150);
      } else if (selectedPriceRange === '150plus') {
        query = query.gte('price', 150);
      }

      const { data, error } = await query;

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

  const getDaysOld = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getIsNew = (createdAt: string) => {
    return getDaysOld(createdAt) <= 7;
  };

  const recentProducts = products.filter(p => getDaysOld(p.created_at) <= 3);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_type')
          .eq('is_active', true)
          .not('product_type', 'is', null);

        if (!error && data) {
          const uniqueCategories = [...new Set(data.map(item => item.product_type))];
          setCategories(uniqueCategories.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);


  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: getProductImage(product),
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
                No products match your filters
              </h3>
              <p className="text-gray-600 mb-6">
                We don't have any items that match your current selection. Get notified when new pieces arrive!
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
  }, [products, isLoading, setShowNewsletterModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Memoized Filter Section */}
      <FilterSection
        selectedCategory={selectedCategory}
        selectedAgeGroup={selectedAgeGroup}
        selectedPriceRange={selectedPriceRange}
        categories={categories}
        productCount={products.length}
        onCategoryChange={handleCategoryChange}
        onAgeGroupChange={handleAgeGroupChange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      {/* Memoized Products Grid */}
      {ProductsGrid}

      

      <Footer />

      <NewsletterModal
        open={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
        onSubscribeSuccess={resetFilters}
      />
    </div>
  );
};

export default NewArrivals;