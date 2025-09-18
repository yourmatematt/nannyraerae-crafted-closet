import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NewArrivals = () => {
  const products = [
    {
      id: 1,
      name: "Garden Party Dress",
      price: 89,
      image: "/src/assets/product-dress.jpg",
      isNew: true,
      limitedStock: 3,
      daysOld: 2
    },
    {
      id: 2,
      name: "Coastal Dreams Romper",
      price: 65,
      image: "/src/assets/product-romper.jpg",
      isNew: true,
      limitedStock: null,
      daysOld: 5
    },
    {
      id: 3,
      name: "Modern Vintage Pants",
      price: 75,
      image: "/src/assets/product-pants.jpg",
      isNew: false,
      limitedStock: 1,
      daysOld: 12
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-warm py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
            Fresh From the Sewing Room
          </h1>
          <p className="font-inter text-xl text-white/90 max-w-2xl mx-auto">
            Discover this week's newest creations - limited quantities available
          </p>
        </div>
      </section>

      {/* Filtering Bar */}
      <section className="border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price Low-High</SelectItem>
                  <SelectItem value="price-high">Price High-Low</SelectItem>
                  <SelectItem value="best-selling">Best Selling</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-3m">0-3 months</SelectItem>
                  <SelectItem value="3-12m">3-12 months</SelectItem>
                  <SelectItem value="1-3y">1-3 years</SelectItem>
                  <SelectItem value="3-5y">3-5 years</SelectItem>
                  <SelectItem value="5-10y">5-10 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm font-inter text-muted-foreground">
              <span className="font-semibold text-primary">12</span> New Items This Month
            </div>
          </div>
        </div>
      </section>

      {/* Just Added Today */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-8">Just Added Today</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter(p => p.daysOld <= 3).map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-muted rounded-xl overflow-hidden mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <Badge className="absolute top-3 left-3 bg-brand-coral text-white font-semibold">
                      NEW
                    </Badge>
                  )}
                  {product.limitedStock && (
                    <Badge variant="secondary" className="absolute top-3 right-3 bg-brand-mustard text-white">
                      Only {product.limitedStock} Left
                    </Badge>
                  )}
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-2">{product.name}</h3>
                <p className="font-inter text-xl font-bold text-primary">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All New Arrivals */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-foreground mb-12 text-center">
            All New Arrivals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200">
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <Badge className="absolute top-3 left-3 bg-brand-coral text-white font-semibold">
                      NEW
                    </Badge>
                  )}
                  {product.limitedStock && (
                    <Badge variant="secondary" className="absolute top-3 right-3 bg-brand-mustard text-white">
                      Limited Edition - Only {product.limitedStock} Left
                    </Badge>
                  )}
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-2">{product.name}</h3>
                <p className="font-inter text-xl font-bold text-primary mb-3">${product.price}</p>
                <Button className="w-full" size="sm">Add to Cart</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-foreground mb-4">Coming Soon</h2>
            <p className="font-inter text-lg text-muted-foreground">
              Get a sneak peek at what's coming to the sewing room
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center">
                <div className="aspect-[3/4] bg-gradient-soft rounded-xl mb-4 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                    <p className="font-inter opacity-90">Coming Soon</p>
                  </div>
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-2">New Summer Collection</h3>
                <p className="font-inter text-sm text-muted-foreground mb-4">Expected: Next Week</p>
                <Button variant="outline" size="sm">Notify Me</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-primary-foreground mb-4">
            Never Miss a New Design
          </h2>
          <p className="font-inter text-lg text-primary-foreground/90 mb-8">
            Join our VIP list for early access to new arrivals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-white"
            />
            <Button variant="secondary" className="px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewArrivals;