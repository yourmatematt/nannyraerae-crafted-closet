import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";
import heroImage from "@/assets/hero-image.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  created_at: string;
  badge?: string;
  stock_quantity?: number;
  in_stock?: boolean;
  age_group?: string;
  gift_category?: string;
}

// Memoized filter section to prevent unnecessary re-renders
const FilterSection = memo(({
  selectedAgeGroup,
  selectedPriceRange,
  productCount,
  onAgeGroupChange,
  onPriceRangeChange
}: {
  selectedAgeGroup: string;
  selectedPriceRange: string;
  productCount: number;
  onAgeGroupChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
}) => (
  <section className="py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">New Baby Gifts</h1>
      <p className="text-lg text-gray-600 mb-10">
        Hospital-perfect first outfits and welcome-home essentials
      </p>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedAgeGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Age Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="3mths">3 months</SelectItem>
              <SelectItem value="6mths">6 months</SelectItem>
              <SelectItem value="9mths">9 months</SelectItem>
              <SelectItem value="1yr">1 year</SelectItem>
              <SelectItem value="2yrs">2 years</SelectItem>
              <SelectItem value="3yrs">3 years</SelectItem>
              <SelectItem value="4yrs">4 years</SelectItem>
              <SelectItem value="5yrs">5 years</SelectItem>
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
        </div>
      </div>
    </div>
  </section>
));

FilterSection.displayName = 'FilterSection';

const NewBaby = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  // Memoized callbacks to prevent unnecessary re-renders
  const handleAgeGroupChange = useCallback((value: string) => {
    setSelectedAgeGroup(value);
  }, []);

  const handlePriceRangeChange = useCallback((value: string) => {
    setSelectedPriceRange(value);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['newBabyGifts', selectedAgeGroup, selectedPriceRange],
    queryFn: async () => {
      // Create mock data for new baby gifts
      const mockProducts = [
        {
          id: 1,
          name: "Welcome Home Romper",
          price: 65,
          image_url: null,
          created_at: new Date().toISOString(),
          badge: "Hospital Ready",
          stock_quantity: 5,
          in_stock: true,
          age_group: "3mths",
          gift_category: "New Baby"
        },
        {
          id: 2,
          name: "First Day Home Outfit",
          price: 85,
          image_url: null,
          created_at: new Date().toISOString(),
          badge: "Organic",
          stock_quantity: 3,
          in_stock: true,
          age_group: "3mths",
          gift_category: "New Baby"
        },
        {
          id: 3,
          name: "Newborn Gift Set",
          price: 120,
          image_url: null,
          created_at: new Date().toISOString(),
          badge: "Gift Set",
          stock_quantity: 2,
          in_stock: true,
          age_group: "3mths",
          gift_category: "New Baby"
        },
        {
          id: 4,
          name: "Baby's First Dress",
          price: 75,
          image_url: null,
          created_at: new Date().toISOString(),
          badge: "Heirloom Quality",
          stock_quantity: 4,
          in_stock: true,
          age_group: "6mths",
          gift_category: "New Baby"
        },
        {
          id: 5,
          name: "Coming Home Pants Set",
          price: 55,
          image_url: null,
          created_at: new Date().toISOString(),
          badge: "Soft Cotton",
          stock_quantity: 6,
          in_stock: true,
          age_group: "3mths",
          gift_category: "New Baby"
        },
        {
          id: 6,
          name: "Precious Moments Collection",
          price: 165,
          image_url: null,
          created_at: new Date().toISOString(),
          badge: "Limited Edition",
          stock_quantity: 1,
          in_stock: true,
          age_group: "3mths",
          gift_category: "New Baby"
        }
      ];

      // Try Supabase query first
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_gift_idea', true)
          .eq('gift_category', 'New Baby')
          .order('created_at', { ascending: false });

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

        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }

      // Filter mock data
      let filteredProducts = mockProducts;

      if (selectedAgeGroup !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.age_group === selectedAgeGroup);
      }

      if (selectedPriceRange === 'under50') {
        filteredProducts = filteredProducts.filter(p => p.price < 50);
      } else if (selectedPriceRange === '50-100') {
        filteredProducts = filteredProducts.filter(p => p.price >= 50 && p.price < 100);
      } else if (selectedPriceRange === '100-150') {
        filteredProducts = filteredProducts.filter(p => p.price >= 100 && p.price < 150);
      } else if (selectedPriceRange === '150plus') {
        filteredProducts = filteredProducts.filter(p => p.price >= 150);
      }

      return filteredProducts;
    }
  });

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

    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  badge: product.badge || undefined
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }, [products, isLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Memoized Filter Section */}
      <FilterSection
        selectedAgeGroup={selectedAgeGroup}
        selectedPriceRange={selectedPriceRange}
        productCount={products.length}
        onAgeGroupChange={handleAgeGroupChange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      {/* Memoized Products Grid */}
      {ProductsGrid}

      <Footer />
    </div>
  );
};

export default NewBaby;