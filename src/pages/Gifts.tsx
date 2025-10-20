import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";
import heroImage from "@/assets/hero-image.jpg";

interface Product {
  id: number
  name: string
  price: number
  image_url?: string
  age_group?: string
  is_gift_idea?: boolean
  collection?: string
  gender?: string
  product_type?: string
  gift_category?: string
  description?: string
  stock: number
  is_active: boolean
  created_at: string
}

const Gifts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPriceRange, setSelectedPriceRange] = useState('0-50')

  useEffect(() => {
    fetchProductsByPriceRange()
  }, [selectedPriceRange])

  const fetchProductsByPriceRange = async () => {
    try {
      setIsLoading(true)

      // Create comprehensive mock data for all price ranges
      const allMockProducts = [
        {
          id: 1, name: 'Garden Party Dress', price: 45, image_url: null,
          age_group: '1yr', is_gift_idea: true, stock: 5, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2, name: 'Special Romper', price: 75, image_url: null,
          age_group: '6mths', is_gift_idea: true, stock: 3, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 3, name: 'Luxury Gift Set', price: 120, image_url: null,
          age_group: '2yrs', is_gift_idea: true, stock: 2, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 4, name: 'Premium Outfit', price: 180, image_url: null,
          age_group: '3yrs', is_gift_idea: true, stock: 1, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 5, name: 'Sweet Hair Bow', price: 25, image_url: null,
          age_group: '1yr', is_gift_idea: true, stock: 10, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 6, name: 'Deluxe Gift Bundle', price: 200, image_url: null,
          age_group: '4yrs', is_gift_idea: true, stock: 1, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 7, name: 'Cute Hair Clip', price: 15, image_url: null,
          age_group: '2yrs', is_gift_idea: true, stock: 8, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 8, name: 'Play Set Outfit', price: 85, image_url: null,
          age_group: '3yrs', is_gift_idea: true, stock: 4, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 9, name: 'Designer Dress', price: 135, image_url: null,
          age_group: '1yr', is_gift_idea: true, stock: 2, is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 10, name: 'Luxury Collection Set', price: 250, image_url: null,
          age_group: '4yrs', is_gift_idea: true, stock: 1, is_active: true,
          created_at: new Date().toISOString()
        }
      ]

      // Try to fetch from Supabase first
      let products = []
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_gift_idea', true)
          .gt('stock', 0)

        // Apply price filtering based on selected range
        if (selectedPriceRange === '0-50') {
          query = query.lt('price', 50)
        } else if (selectedPriceRange === '50-100') {
          query = query.gte('price', 50).lt('price', 100)
        } else if (selectedPriceRange === '100-150') {
          query = query.gte('price', 100).lt('price', 150)
        } else if (selectedPriceRange === '150-999') {
          query = query.gte('price', 150)
        }

        query = query.order('created_at', { ascending: false })
        const { data, error } = await query

        if (!error && data && data.length > 0) {
          products = data
        }
      } catch (dbError) {
        console.log('Database query failed, using mock data')
      }

      // If no products from database, use filtered mock data
      if (products.length === 0) {
        if (selectedPriceRange === '0-50') {
          products = allMockProducts.filter(p => p.price < 50)
        } else if (selectedPriceRange === '50-100') {
          products = allMockProducts.filter(p => p.price >= 50 && p.price < 100)
        } else if (selectedPriceRange === '100-150') {
          products = allMockProducts.filter(p => p.price >= 100 && p.price < 150)
        } else if (selectedPriceRange === '150-999') {
          products = allMockProducts.filter(p => p.price >= 150)
        }
      }

      setProducts(products)
    } catch (error) {
      console.error('Error in fetchProductsByPriceRange:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const getPriceRangeDescription = () => {
    switch (selectedPriceRange) {
      case '0-50':
        return 'Sweet accessories and small pieces'
      case '50-100':
        return 'Individual statement pieces'
      case '100-150':
        return 'Premium pieces or small sets'
      case '150-999':
        return 'Complete sets and exclusive designs'
      default:
        return 'Sweet accessories and small pieces'
    }
  }

  const occasions = [
    {
      name: "New Baby",
      description: "Hospital-perfect first outfits",
      image: productRomper,
      priceRange: "$65-120",
      route: "/gifts/new-baby"
    },
    {
      name: "First Birthday",
      description: "Special occasion wear",
      image: productDress,
      priceRange: "$75-150",
      route: "/gifts/first-birthday"
    },
    {
      name: "Christmas",
      description: "Festive and photo-worthy",
      image: productPants,
      priceRange: "$80-180",
      route: "/gifts/christmas"
    },
    {
      name: "Easter",
      description: "Spring designs",
      image: heroImage,
      priceRange: "$70-140",
      route: "/gifts/easter"
    },
    {
      name: "Starting School",
      description: "Confidence-building pieces",
      image: productRomper,
      priceRange: "$85-160",
      route: "/gifts/starting-school"
    },
    {
      name: "Big Sibling",
      description: "Celebrating new roles",
      image: productPants,
      priceRange: "$90-170",
      route: "/gifts/big-sibling"
    }
  ];

  const giftSets = [
    {
      name: "Welcome Baby Set",
      description: "3 essential pieces plus soft blanket",
      price: 189,
      originalPrice: 220,
      image: productRomper,
      includes: ["Organic romper", "Soft pants", "Welcome hat", "Bamboo blanket"]
    },
    {
      name: "Toddler Essentials Set",
      description: "Perfect for active little ones",
      price: 165,
      originalPrice: 195,
      image: productDress,
      includes: ["Play dress", "Comfortable pants", "Matching headband"]
    },
    {
      name: "Special Occasion Set",
      description: "Party-ready coordinated pieces",
      price: 210,
      originalPrice: 245,
      image: heroImage,
      includes: ["Formal dress", "Cardigan", "Special occasion accessories"]
    },
    {
      name: "Seasonal Favorites Set",
      description: "Current season's best pieces",
      price: 145,
      originalPrice: 170,
      image: productPants,
      includes: ["2 seasonal pieces", "Coordinating accessories"]
    }
  ];

  const priceRanges = [
    {
      range: "Under $50",
      description: "Sweet accessories and small pieces",
      suggestions: "Hair accessories, bibs, small tops",
      color: "bg-brand-sky"
    },
    {
      range: "$50-$100",
      description: "Individual statement pieces",
      suggestions: "Dresses, rompers, special pants",
      color: "bg-brand-coral"
    },
    {
      range: "$100-$150",
      description: "Premium pieces or small sets",
      suggestions: "Limited edition items, coordinated sets",
      color: "bg-brand-mustard"
    },
    {
      range: "Luxury Gifts ($150+)",
      description: "Complete sets and exclusive designs",
      suggestions: "Full gift sets, custom orders",
      color: "bg-brand-lavender"
    }
  ];

  const recipients = [
    { name: "Grandchildren", icon: "👶", color: "bg-brand-coral" },
    { name: "Nieces & Nephews", icon: "👧", color: "bg-brand-sky" },
    { name: "Best Friend's Children", icon: "👦", color: "bg-brand-mustard" },
    { name: "Teacher Gifts", icon: "🎁", color: "bg-brand-lavender" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Page Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gift Ideas</h1>
          <p className="text-lg text-gray-600 mb-10">
            Perfect presents for the special little ones in your life
          </p>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center gap-4">
              <Select>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="By Age" />
                </SelectTrigger>
                <SelectContent>
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

              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="By Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                  <SelectItem value="Gender Neutral">Gender Neutral</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="By Occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baby">New Baby</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="christmas">Christmas</SelectItem>
                  <SelectItem value="easter">Easter</SelectItem>
                  <SelectItem value="school">Starting School</SelectItem>
                </SelectContent>
              </Select>

            </div>

            <div className="text-sm text-gray-600">
              <span className="font-semibold">6</span> occasions
            </div>
          </div>
        </div>
      </section>

      {/* Gift by Occasion */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasions.map((occasion) => (
              <div
                key={occasion.name}
                className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200"
                onClick={() => navigate(occasion.route)}
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-playfair text-xl font-bold text-foreground mb-2">{occasion.name}</h3>
                  <p className="font-inter text-muted-foreground mb-3">{occasion.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-sm text-primary font-semibold">{occasion.priceRange}</span>
                    <Button variant="outline" size="sm">Shop Now</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Budget */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Shop By Budget
          </h2>

          {/* Price Range Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted rounded-full p-1 inline-flex max-w-2xl w-full">
              {[
                { id: '0-50', label: 'Under $50' },
                { id: '50-100', label: '$50-$100' },
                { id: '100-150', label: '$100-$150' },
                { id: '150-999', label: '$150+' }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedPriceRange(range.id)}
                  className={`flex-1 px-8 py-2.5 text-sm font-medium transition-all duration-200 rounded-full relative whitespace-nowrap ${
                    selectedPriceRange === range.id
                      ? 'text-foreground bg-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 text-center mb-10">
            {getPriceRangeDescription()}
          </p>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                No products in this price range
              </h3>
              <p className="text-gray-600 mb-6">
                Try selecting a different price range to see more options.
              </p>
              <Button variant="outline" onClick={() => setSelectedPriceRange('0-50')}>
                View Under $50
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    badge: product.stock > 0 ? undefined : 'Sold Out',
                    description: `Perfect for ${product.age_group || 'all ages'}`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gift Sets */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-foreground mb-4">
              Curated Gift Sets
            </h2>
            <p className="font-inter text-lg text-muted-foreground">
              Thoughtfully bundled pieces with special packaging and savings
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {giftSets.map((set) => (
              <div key={set.name} className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2 aspect-[4/3] md:aspect-auto bg-muted overflow-hidden">
                    <img 
                      src={set.image} 
                      alt={set.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-playfair text-xl font-bold text-foreground">{set.name}</h3>
                        <Badge className="bg-brand-coral text-white">Set Savings</Badge>
                      </div>
                      <p className="font-inter text-muted-foreground mb-4">{set.description}</p>
                      <div className="mb-4">
                        <h4 className="font-inter font-semibold text-foreground mb-2">What's Included:</h4>
                        <ul className="space-y-1">
                          {(set.includes || []).map((item, index) => (
                            <li key={index} className="font-inter text-sm text-muted-foreground flex items-center gap-2">
                              <span className="text-primary">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-inter text-2xl font-bold text-primary">${set.price}</span>
                        {(set.original_price || set.originalPrice) && (
                          <>
                            <span className="font-inter text-lg text-muted-foreground line-through">${set.original_price || set.originalPrice}</span>
                            <Badge variant="secondary" className="text-xs">Save ${(set.original_price || set.originalPrice) - set.price}</Badge>
                          </>
                        )}
                      </div>
                      <Button className="w-full">Add Gift Set to Cart</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
};

export default Gifts;