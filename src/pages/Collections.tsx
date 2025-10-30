import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterModal } from "@/components/NewsletterModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
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
  product_type?: string;
  age_group?: string;
  gender?: string;
  collection?: string;
  badge?: string;
  stock?: number;
}

const Collections = () => {
  const { addToCart, items } = useCart();
  const [searchParams] = useSearchParams();
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedSortBy, setSelectedSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [soldCurrentPage, setSoldCurrentPage] = useState(1);
  const [allSoldProducts, setAllSoldProducts] = useState<Product[]>([]);

  // Category options matching the admin dashboard product upload form
  const categories = [
    "Dress",
    "Jacket",
    "Overalls",
    "Pants",
    "Romper",
    "Sets",
    "Shirts",
    "Shorts",
    "Top"
  ];

  const PRODUCTS_PER_PAGE = 12;

  // Reset pagination and products when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllProducts([]);
    setSoldCurrentPage(1);
    setAllSoldProducts([]);
  }, [selectedCategory, selectedAgeGroup, selectedGender, selectedPriceRange, selectedSortBy]);

  // Handle URL search parameters on component mount
  useEffect(() => {
    const sizeParam = searchParams.get('size');
    if (sizeParam) {
      // Valid size values that match our age group options
      const validSizes = ['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs'];
      if (validSizes.includes(sizeParam)) {
        setSelectedAgeGroup(sizeParam);
      }
    }
  }, [searchParams]);


  const { data: newProducts = [], isLoading, refetch } = useQuery({
    queryKey: ['allProducts', selectedCategory, selectedAgeGroup, selectedGender, selectedPriceRange, selectedSortBy, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('stock', 1);

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('product_type', selectedCategory);
      }

      // Apply age group filter
      if (selectedAgeGroup !== 'all') {
        query = query.eq('age_group', selectedAgeGroup);
      }

      // Apply gender filter
      if (selectedGender !== 'all') {
        query = query.eq('gender', selectedGender);
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

      // Apply sorting
      if (selectedSortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (selectedSortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (selectedSortBy === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (selectedSortBy === 'price-high') {
        query = query.order('price', { ascending: false });
      }

      // Apply pagination
      const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;
      query = query.range(offset, offset + PRODUCTS_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return [
          {
            id: 1,
            name: "Garden Party Dress",
            price: 89,
            image_url: null,
            created_at: new Date().toISOString(),
            product_type: "Dress",
            age_group: "2yrs",
            gender: "Girls",
            collection: "Garden Party",
            stock: 1
          },
          {
            id: 2,
            name: "Coastal Dreams Romper",
            price: 65,
            image_url: null,
            created_at: new Date().toISOString(),
            product_type: "Romper",
            age_group: "1yr",
            gender: "Gender Neutral",
            collection: "Coastal Dreams",
            stock: 1
          },
          {
            id: 3,
            name: "Modern Vintage Pants",
            price: 75,
            image_url: null,
            created_at: new Date().toISOString(),
            product_type: "Pants",
            age_group: "3yrs",
            gender: "Boys",
            collection: "Modern Vintage",
            stock: 1
          }
        ];
      }

      return data as Product[];
    }
  });

  // Accumulate products when new data arrives
  useEffect(() => {
    if (newProducts.length > 0) {
      if (currentPage === 1) {
        // First page - replace all products
        setAllProducts(newProducts);
      } else {
        // Additional pages - append to existing products
        setAllProducts(prev => [...prev, ...newProducts]);
      }
    }
  }, [newProducts, currentPage]);

  // Get total count for Load More functionality
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['productCount', selectedCategory, selectedAgeGroup, selectedGender, selectedPriceRange],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('stock', 1);

      // Apply same filters as main query
      if (selectedCategory !== 'all') {
        query = query.eq('product_type', selectedCategory);
      }
      if (selectedAgeGroup !== 'all') {
        query = query.eq('age_group', selectedAgeGroup);
      }
      if (selectedGender !== 'all') {
        query = query.eq('gender', selectedGender);
      }
      if (selectedPriceRange === 'under50') {
        query = query.lt('price', 50);
      } else if (selectedPriceRange === '50-100') {
        query = query.gte('price', 50).lt('price', 100);
      } else if (selectedPriceRange === '100-150') {
        query = query.gte('price', 100).lt('price', 150);
      } else if (selectedPriceRange === '150plus') {
        query = query.gte('price', 150);
      }

      const { count, error } = await query;
      if (error) {
        console.error('Error fetching product count:', error);
        return 0;
      }
      return count || 0;
    }
  });

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    const images = [productDress, productRomper, productPants];
    return images[product.id % images.length];
  };

  // Get sold/out of stock products for Previous Pieces section
  const { data: newSoldProducts = [], isLoading: isLoadingSold } = useQuery({
    queryKey: ['soldProducts', selectedCategory, selectedAgeGroup, selectedGender, selectedPriceRange, selectedSortBy, soldCurrentPage],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('stock', 0);

      // Apply same filters as main query
      if (selectedCategory !== 'all') {
        query = query.eq('product_type', selectedCategory);
      }
      if (selectedAgeGroup !== 'all') {
        query = query.eq('age_group', selectedAgeGroup);
      }
      if (selectedGender !== 'all') {
        query = query.eq('gender', selectedGender);
      }
      if (selectedPriceRange === 'under50') {
        query = query.lt('price', 50);
      } else if (selectedPriceRange === '50-100') {
        query = query.gte('price', 50).lt('price', 100);
      } else if (selectedPriceRange === '100-150') {
        query = query.gte('price', 100).lt('price', 150);
      } else if (selectedPriceRange === '150plus') {
        query = query.gte('price', 150);
      }

      // Apply sorting
      if (selectedSortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (selectedSortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (selectedSortBy === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (selectedSortBy === 'price-high') {
        query = query.order('price', { ascending: false });
      }

      // Apply pagination
      const offset = (soldCurrentPage - 1) * PRODUCTS_PER_PAGE;
      query = query.range(offset, offset + PRODUCTS_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sold products:', error);
        return [
          {
            id: 101,
            name: "Vintage Rose Dress",
            price: 95,
            image_url: null,
            created_at: new Date().toISOString(),
            product_type: "Dress",
            age_group: "2yrs",
            gender: "Girls",
            stock: 0
          },
          {
            id: 102,
            name: "Garden Party Romper",
            price: 78,
            image_url: null,
            created_at: new Date().toISOString(),
            product_type: "Romper",
            age_group: "1yr",
            gender: "Gender Neutral",
            stock: 0
          }
        ];
      }

      return data as Product[];
    }
  });

  // Accumulate sold products when new data arrives
  useEffect(() => {
    if (newSoldProducts.length > 0) {
      if (soldCurrentPage === 1) {
        // First page - replace all sold products
        setAllSoldProducts(newSoldProducts);
      } else {
        // Additional pages - append to existing sold products
        setAllSoldProducts(prev => [...prev, ...newSoldProducts]);
      }
    }
  }, [newSoldProducts, soldCurrentPage]);

  // Get total count of sold products for Load More functionality
  const { data: soldTotalCount = 0 } = useQuery({
    queryKey: ['soldProductCount', selectedCategory, selectedAgeGroup, selectedGender, selectedPriceRange],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('stock', 0);

      // Apply same filters as sold products query
      if (selectedCategory !== 'all') {
        query = query.eq('product_type', selectedCategory);
      }
      if (selectedAgeGroup !== 'all') {
        query = query.eq('age_group', selectedAgeGroup);
      }
      if (selectedGender !== 'all') {
        query = query.eq('gender', selectedGender);
      }
      if (selectedPriceRange === 'under50') {
        query = query.lt('price', 50);
      } else if (selectedPriceRange === '50-100') {
        query = query.gte('price', 50).lt('price', 100);
      } else if (selectedPriceRange === '100-150') {
        query = query.gte('price', 100).lt('price', 150);
      } else if (selectedPriceRange === '150plus') {
        query = query.gte('price', 150);
      }

      const { count, error } = await query;
      if (error) {
        console.error('Error fetching sold product count:', error);
        return 0;
      }
      return count || 0;
    }
  });

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

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedAgeGroup('all');
    setSelectedGender('all');
    setSelectedPriceRange('all');
    setSelectedSortBy('newest');
    setCurrentPage(1);
  }, []);

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const loadMoreSold = () => {
    setSoldCurrentPage(prev => prev + 1);
  };

  const hasMoreProducts = allProducts.length < totalCount;
  const hasMoreSoldProducts = allSoldProducts.length < soldTotalCount;

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
    )}>
      <Navigation />

      {/* Page Header */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#8E5A3B' }}>
              Collection
            </h1>
            <p className="font-inter text-xl mb-4 text-muted-foreground">
              Discover our complete range of handcrafted children's clothing
            </p>
            <p className="font-inter text-lg text-muted-foreground">
              Each piece lovingly crafted with attention to detail and comfort
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
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

              {/* Age Group Filter */}
              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
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

              {/* Gender Filter */}
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                  <SelectItem value="Gender Neutral">Gender Neutral</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range Filter */}
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
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

              {/* Sort Filter */}
              <Select value={selectedSortBy} onValueChange={setSelectedSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count and Reset */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{totalCount}</span> products found
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button onClick={resetFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    badge: product.badge
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Load More Button */}
      {!isLoading && allProducts.length > 0 && hasMoreProducts && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button
              onClick={loadMore}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Load More Products
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Showing {allProducts.length} of {totalCount} products
            </p>
          </div>
        </section>
      )}

      {/* Previous Pieces Section */}
      {allSoldProducts.length > 0 && (
        <>
          {/* Visual Separator */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-t border-gray-300 pt-8">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                    <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Previous Collection
                    </span>
                    <span className="w-3 h-3 bg-gray-400 rounded-full ml-2"></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Previous Pieces Grid */}
          <section className="py-8 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#8E5A3B' }}>Previous Pieces</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Beautiful pieces that have found their forever homes. Each one was crafted with the same love and attention to detail.
                </p>
              </div>

              {isLoadingSold && soldCurrentPage === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-300 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allSoldProducts.map((product) => (
                    <div key={product.id} className="relative group">
                      {/* Sold Product Card with modified styling */}
                      <div className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                        {/* Product Image with overlay */}
                        <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Sold Pill */}
                          <div className="absolute top-3 right-3">
                            <div className="bg-white bg-opacity-95 px-3 py-1 rounded-full">
                              <span className="text-gray-800 font-semibold text-xs uppercase tracking-wide">
                                Sold
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-700 mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-lg font-semibold text-gray-500">
                            ${product.price}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            This piece has been sold
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button for Sold Products */}
              {!isLoadingSold && allSoldProducts.length > 0 && hasMoreSoldProducts && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMoreSold}
                    size="lg"
                    variant="outline"
                    className="border-gray-400 text-gray-700 hover:bg-gray-50"
                  >
                    Load More Previous Pieces
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Showing {allSoldProducts.length} of {soldTotalCount} previous pieces
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Spacing before footer */}
      <div className="py-8"></div>

      <Footer />

      <NewsletterModal
        open={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
        onSubscribeSuccess={() => setShowNewsletterModal(false)}
      />
    </div>
  );
};

export default Collections;