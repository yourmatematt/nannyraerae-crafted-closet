import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";

const FeaturedCollections = () => {
  const [newestProduct, setNewestProduct] = useState<Product | null>(null)
  const [giftProduct, setGiftProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchFeaturedData()
  }, [])

  const fetchFeaturedData = async () => {
    try {
      // Get newest product from last 7 days
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: newProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (newProducts && newProducts.length > 0) {
        setNewestProduct(newProducts[0])
      }

      // Get a gift idea product
      const { data: giftProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_gift_idea', true)
        .limit(1)

      if (giftProducts && giftProducts.length > 0) {
        setGiftProduct(giftProducts[0])
      }
    } catch (error) {
      console.error('Error fetching featured data:', error)
    }
  }

  const collections = [
    {
      title: "New This Week",
      subtitle: "Fresh arrivals just added",
      bgColor: "bg-gradient-hero",
      textColor: "text-white",
      hoverTextColor: "text-pink-800",
      link: "/new-arrivals",
      image: newestProduct?.image_url || productDress,
    },
    {
      title: "Shop by Age",
      subtitle: "Find the perfect fit",
      bgColor: "bg-accent",
      textColor: "text-white",
      hoverTextColor: "text-slate-800",
      link: "/shop-by-age",
      image: productPants,
    },
    {
      title: "Gift Ready",
      subtitle: "Perfect for special occasions",
      bgColor: "bg-gradient-warm",
      textColor: "text-white",
      hoverTextColor: "text-orange-800",
      link: "/gifts",
      image: giftProduct?.image_url || productRomper,
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-playfair text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#8E5A3B' }}>
          Discover Our Collections
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Each collection tells a unique story, crafted with love and attention to detail
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {collections.map((collection, index) => (
          <Link
            key={index}
            to={collection.link}
            className="block group"
          >
            <div
              className={`${collection.bgColor} rounded-2xl overflow-hidden min-h-[400px] group hover:scale-105 transition-transform duration-300 shadow-medium hover:shadow-large relative`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="relative p-8 lg:p-12 h-full flex flex-col justify-between">
                <div>
                  <h3 className={`font-playfair text-2xl lg:text-3xl font-bold ${collection.textColor} mb-3`}>
                    {collection.title}
                  </h3>
                  <p className={`font-inter text-lg ${collection.textColor} opacity-90 mb-8`}>
                    {collection.subtitle}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className={`self-start bg-transparent border-white text-white hover:bg-white ${collection.hoverTextColor} font-inter font-semibold px-6 py-3 rounded-full transition-all duration-300`}
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;