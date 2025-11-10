import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import productDress from "@/assets/product-dress.jpg";
import productRomper from "@/assets/product-romper.jpg";
import productPants from "@/assets/product-pants.jpg";

const ShopByAgeOverview = () => {
  const [ageGroupImages, setAgeGroupImages] = useState({});

  useEffect(() => {
    fetchAgeGroupImages();
  }, []);

  const fetchAgeGroupImages = async () => {
    try {
      const ageGroups = ['3mths', '6mths', '9mths', '1yr', '2yrs', '3yrs', '4yrs', '5yrs'];
      const imageMap = {};

      for (const age of ageGroups) {
        try {
          const { data: recentProduct } = await supabase
            .from('products')
            .select('image_url')
            .gt('stock', 0)
            .eq('age_group', age)
            .order('created_at', { ascending: false })
            .limit(1);

          if (recentProduct && recentProduct.length > 0 && recentProduct[0].image_url) {
            imageMap[age] = recentProduct[0].image_url;
          }
        } catch (imageError) {
          console.error(`Error fetching image for age group ${age}:`, imageError);
        }
      }

      console.log('Age group images:', imageMap);
      setAgeGroupImages(imageMap);
    } catch (error) {
      console.error('Error fetching age group images:', error);
    }
  };
  const sizeRanges = [
    {
      title: "3 Months",
      subtitle: "Perfect for precious little ones",
      ageGroup: "3mths",
      placeholderImage: productDress,
      description: "Soft, gentle fabrics for baby's delicate skin"
    },
    {
      title: "6 Months",
      subtitle: "Growing and exploring in comfort",
      ageGroup: "6mths",
      placeholderImage: productRomper,
      description: "Durable designs for active babies"
    },
    {
      title: "9 Months",
      subtitle: "Mobile babies need comfortable clothes",
      ageGroup: "9mths",
      placeholderImage: productPants,
      description: "Crawling-friendly designs that stay in place"
    },
    {
      title: "1 Year",
      subtitle: "Perfect for little adventurers",
      ageGroup: "1yr",
      placeholderImage: productDress,
      description: "Easy-dress designs for active toddlers"
    },
    {
      title: "2 Years",
      subtitle: "For confident little walkers",
      ageGroup: "2yrs",
      placeholderImage: productRomper,
      description: "Durable designs for playground adventures"
    },
    {
      title: "3 Years",
      subtitle: "Ready for preschool and play",
      ageGroup: "3yrs",
      placeholderImage: productPants,
      description: "Comfortable styles for all-day wear"
    },
    {
      title: "4 Years",
      subtitle: "Independent dressers need practical styles",
      ageGroup: "4yrs",
      placeholderImage: productDress,
      description: "Self-dressing friendly designs"
    },
    {
      title: "5 Years",
      subtitle: "Stylish pieces for confident kids",
      ageGroup: "5yrs",
      placeholderImage: productRomper,
      description: "Fashion-forward designs kids love to wear"
    }
  ];

  // Add real images to size ranges
  const sizeRangesWithImages = sizeRanges.map(range => ({
    ...range,
    image: ageGroupImages[range.ageGroup] || range.placeholderImage
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#8E5A3B' }}>
            Shop by Age
          </h1>
          <p className="font-inter text-lg lg:text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            Find the perfect fit for your little one. Each age group is thoughtfully designed with
            developmental needs and comfort in mind.
          </p>
        </div>
      </section>

      {/* Size Range Cards Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {sizeRangesWithImages.map((range, index) => (
              <Link
                key={index}
                to={`/collection?age=${range.ageGroup}`}
                className="block group"
              >
                <div className="bg-accent rounded-2xl overflow-hidden min-h-[400px] group hover:scale-105 transition-transform duration-300 shadow-medium hover:shadow-large relative">
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-20">
                    <img
                      src={range.image}
                      alt={range.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="relative p-8 lg:p-12 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-playfair text-2xl lg:text-3xl font-bold text-white mb-3">
                        {range.title}
                      </h3>
                      <p className="font-inter text-lg text-white opacity-90 mb-4">
                        {range.subtitle}
                      </p>
                      <p className="font-inter text-sm text-white opacity-80 mb-8">
                        {range.description}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="self-start bg-transparent border-white text-white hover:bg-white hover:text-slate-800 font-inter font-semibold px-6 py-3 rounded-full transition-all duration-300"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Why Size Matters
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-12 leading-relaxed">
            Every stage of your child's development brings unique needs. Our age-specific collections
            ensure the perfect fit, comfort, and functionality for each precious milestone.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👶</span>
              </div>
              <h3 className="font-inter font-semibold text-foreground mb-2">Perfect Fit</h3>
              <p className="font-inter text-sm text-muted-foreground">
                Designed specifically for each developmental stage
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-inter font-semibold text-foreground mb-2">Quality Materials</h3>
              <p className="font-inter text-sm text-muted-foreground">
                Soft, breathable fabrics that grow with your child
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="font-inter font-semibold text-foreground mb-2">Handcrafted Love</h3>
              <p className="font-inter text-sm text-muted-foreground">
                Every piece made with grandmotherly care and attention
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopByAgeOverview;