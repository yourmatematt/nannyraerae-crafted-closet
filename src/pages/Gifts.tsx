import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Gifts = () => {
  const occasions = [
    {
      name: "New Baby",
      description: "Hospital-perfect first outfits",
      image: "/src/assets/product-romper.jpg",
      priceRange: "$65-120"
    },
    {
      name: "First Birthday",
      description: "Special occasion wear",
      image: "/src/assets/product-dress.jpg",
      priceRange: "$75-150"
    },
    {
      name: "Christmas",
      description: "Festive and photo-worthy",
      image: "/src/assets/product-pants.jpg",
      priceRange: "$80-180"
    },
    {
      name: "Easter",
      description: "Spring designs",
      image: "/src/assets/product-dress.jpg",
      priceRange: "$70-140"
    },
    {
      name: "Starting School",
      description: "Confidence-building pieces",
      image: "/src/assets/product-romper.jpg",
      priceRange: "$85-160"
    },
    {
      name: "Big Sibling",
      description: "Celebrating new roles",
      image: "/src/assets/product-pants.jpg",
      priceRange: "$90-170"
    }
  ];

  const giftSets = [
    {
      name: "Welcome Baby Set",
      description: "3 essential pieces plus soft blanket",
      price: 189,
      originalPrice: 220,
      image: "/src/assets/product-romper.jpg",
      includes: ["Organic romper", "Soft pants", "Welcome hat", "Bamboo blanket"]
    },
    {
      name: "Toddler Essentials Set",
      description: "Perfect for active little ones",
      price: 165,
      originalPrice: 195,
      image: "/src/assets/product-dress.jpg",
      includes: ["Play dress", "Comfortable pants", "Matching headband"]
    },
    {
      name: "Special Occasion Set",
      description: "Party-ready coordinated pieces",
      price: 210,
      originalPrice: 245,
      image: "/src/assets/product-pants.jpg",
      includes: ["Formal dress", "Cardigan", "Special occasion accessories"]
    },
    {
      name: "Seasonal Favorites Set",
      description: "Current season's best pieces",
      price: 145,
      originalPrice: 170,
      image: "/src/assets/product-dress.jpg",
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
            Gifts That Tell a Story
          </h1>
          <p className="font-inter text-xl text-white/90 mb-8">
            Perfect presents for the special little ones in your life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Select>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="By Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-3m">Newborn (0-3m)</SelectItem>
                <SelectItem value="3-12m">Baby (3-12m)</SelectItem>
                <SelectItem value="1-3y">Toddler (1-3y)</SelectItem>
                <SelectItem value="3-5y">Preschool (3-5y)</SelectItem>
                <SelectItem value="5-10y">School Age (5-10y)</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48 bg-white">
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
            <Select>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="By Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under50">Under $50</SelectItem>
                <SelectItem value="50-100">$50-$100</SelectItem>
                <SelectItem value="100-150">$100-$150</SelectItem>
                <SelectItem value="150plus">$150+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Gift by Occasion */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Shop by Occasion
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasions.map((occasion) => (
              <div key={occasion.name} className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-200">
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

      {/* Gift by Recipient */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Perfect Gifts For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipients.map((recipient) => (
              <div key={recipient.name} className="group cursor-pointer text-center">
                <div className={`w-24 h-24 mx-auto mb-4 ${recipient.color} rounded-full flex items-center justify-center text-4xl text-white group-hover:scale-110 transition-transform duration-200`}>
                  {recipient.icon}
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-2">{recipient.name}</h3>
                <Button variant="outline" size="sm">Browse Gifts</Button>
              </div>
            ))}
          </div>
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
                          {set.includes.map((item, index) => (
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
                        <span className="font-inter text-lg text-muted-foreground line-through">${set.originalPrice}</span>
                        <Badge variant="secondary" className="text-xs">Save ${set.originalPrice - set.price}</Badge>
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

      {/* Price Range Guides */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Shop by Budget
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {priceRanges.map((range) => (
              <div key={range.range} className="group cursor-pointer">
                <div className={`${range.color} rounded-xl p-6 text-white mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  <h3 className="font-playfair text-xl font-bold mb-2">{range.range}</h3>
                  <p className="font-inter text-sm opacity-90 mb-3">{range.description}</p>
                  <p className="font-inter text-xs opacity-80">{range.suggestions}</p>
                </div>
                <Button variant="outline" className="w-full">View Options</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Services */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-soft rounded-2xl p-8 text-center text-white">
            <h2 className="font-playfair text-3xl font-bold mb-6">
              Complete Gift Services
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <span className="font-inter">Free gift wrapping on all orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💌</span>
                <span className="font-inter">Personal message card included</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <span className="font-inter">Special gift packaging available</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <span className="font-inter">Gift receipts (price hidden)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚚</span>
                <span className="font-inter">Direct shipping to recipient</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <span className="font-inter">Digital gift cards available</span>
              </div>
            </div>
            <Button variant="secondary" size="lg">
              Learn More About Gift Services
            </Button>
          </div>
        </div>
      </section>

      {/* Personal Shopper Service */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <div className="text-center mb-8">
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-4">
                Not Sure What to Choose?
              </h2>
              <p className="font-inter text-lg text-muted-foreground">
                Let Nanny Rae Rae help you find the perfect gift
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-inter font-semibold text-foreground mb-4">Personal Shopper Service</h3>
                <p className="font-inter text-muted-foreground mb-6">
                  Share some details about the special child in your life, and I'll personally recommend the perfect pieces for them.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary">✓</span>
                    <span className="font-inter text-muted-foreground">Personal recommendations within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary">✓</span>
                    <span className="font-inter text-muted-foreground">Size and style guidance</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary">✓</span>
                    <span className="font-inter text-muted-foreground">Budget-friendly options</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary">✓</span>
                    <span className="font-inter text-muted-foreground">Completely free service</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-inter font-medium text-foreground block mb-2">Child's Age</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3m">Newborn (0-3 months)</SelectItem>
                      <SelectItem value="3-12m">Baby (3-12 months)</SelectItem>
                      <SelectItem value="1-3y">Toddler (1-3 years)</SelectItem>
                      <SelectItem value="3-5y">Preschool (3-5 years)</SelectItem>
                      <SelectItem value="5-10y">School Age (5-10 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-inter font-medium text-foreground block mb-2">Occasion</label>
                  <Input placeholder="e.g., First Birthday, Christmas, Just Because" />
                </div>
                <div>
                  <label className="font-inter font-medium text-foreground block mb-2">Budget Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under50">Under $50</SelectItem>
                      <SelectItem value="50-100">$50-$100</SelectItem>
                      <SelectItem value="100-150">$100-$150</SelectItem>
                      <SelectItem value="150plus">$150+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-inter font-medium text-foreground block mb-2">Any Preferences?</label>
                  <Textarea placeholder="Colors they love, style preferences, or anything else I should know..." />
                </div>
                <Button className="w-full" size="lg">
                  Get Personal Recommendations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gifts;