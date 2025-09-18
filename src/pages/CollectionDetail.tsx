import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CollectionDetail = () => {
  const { collectionName } = useParams();
  
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

  const products = [
    {
      id: 1,
      name: "Blooming Dress",
      price: 89,
      image: "/src/assets/product-dress.jpg",
      colors: ["Pink", "Blue", "Green"]
    },
    {
      id: 2,
      name: "Petal Romper",
      price: 65,
      image: "/src/assets/product-romper.jpg",
      colors: ["White", "Yellow"]
    },
    {
      id: 3,
      name: "Garden Pants",
      price: 75,
      image: "/src/assets/product-pants.jpg",
      colors: ["Green", "Pink"]
    }
  ];

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
    <div className="min-h-screen bg-background">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200">
                <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-inter text-sm text-muted-foreground">Available in:</span>
                  {product.colors.map((color, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
                <p className="font-inter text-xl font-bold text-primary mb-3">${product.price}</p>
                <Button className="w-full" size="sm">Add to Cart</Button>
              </div>
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