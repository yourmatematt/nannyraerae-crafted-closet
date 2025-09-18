import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const About = () => {
  const values = [
    {
      icon: "⭐",
      title: "Quality First",
      description: "Built to last through adventures"
    },
    {
      icon: "✨",
      title: "Exclusive Designs",
      description: "You won't find these anywhere else"
    },
    {
      icon: "💝",
      title: "Personal Touch",
      description: "Every order packed with care"
    },
    {
      icon: "🌱",
      title: "Sustainable Practice",
      description: "Small batch, no waste"
    },
    {
      icon: "🇦🇺",
      title: "Australian Made",
      description: "Supporting local, made with pride"
    },
    {
      icon: "👵",
      title: "Grandma Tested",
      description: "Practical designs that actually work"
    }
  ];

  const processSteps = [
    { step: 1, title: "Design Inspiration", description: "Drawing from nature, trends, and grandchildren's needs" },
    { step: 2, title: "Fabric Selection", description: "Choosing only the finest organic and sustainable materials" },
    { step: 3, title: "Pattern Making", description: "Creating custom patterns for perfect fit and comfort" },
    { step: 4, title: "Cutting", description: "Carefully cutting each piece with precision and care" },
    { step: 5, title: "Sewing", description: "Hand-sewn details and machine-finished seams for durability" },
    { step: 6, title: "Quality Check", description: "Every piece inspected to meet our high standards" },
    { step: 7, title: "Personal Packaging", description: "Lovingly packaged with personal touches" },
    { step: 8, title: "Sent with Love", description: "Delivered to your family with joy and excitement" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Brisbane",
      text: "The quality is absolutely incredible. My daughter has worn her Garden Party dress to three different occasions and it still looks brand new. You can tell it's made with real love and expertise.",
      image: "/src/assets/hero-image.jpg"
    },
    {
      name: "Emma K.",
      location: "Melbourne",
      text: "I've been buying from Nanny Rae Rae for two years now. The designs are so unique - people always ask where we got our clothes from. The customer service is also exceptional.",
      image: "/src/assets/product-dress.jpg"
    },
    {
      name: "Lisa T.",
      location: "Sydney",
      text: "Finally found clothes that are both beautiful and practical! My twins love their matching outfits, and I love that they're Australian made with such attention to detail.",
      image: "/src/assets/product-romper.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden shadow-large">
                <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-6xl">👵</span>
                    </div>
                    <p className="font-inter text-xl opacity-90">Hello, I'm Nanny Rae Rae</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-brand-coral/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-mustard/20 rounded-full blur-2xl"></div>
            </div>
            
            <div>
              <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Hello, I'm Nanny Rae Rae
              </h1>
              <p className="font-inter text-xl text-muted-foreground mb-8 leading-relaxed">
                From my sewing room to your family
              </p>
              <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
                Welcome to my world of handmade children's fashion. Every piece that leaves my sewing room carries with it the love, care, and expertise I've developed over decades of creating beautiful clothes for the little ones I cherish most.
              </p>
              <Button size="lg" className="font-inter font-semibold">
                Shop My Creations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Story Chapters */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Chapter 1 */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="font-playfair text-3xl font-bold text-foreground mb-6">
                  It Started with Love
                </h2>
                <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
                  When I became a grandmother, everything changed. I wanted to create something truly special for my grandchildren – clothes that weren't just beautiful, but told a story of love and care with every stitch.
                </p>
                <p className="font-inter text-lg text-muted-foreground leading-relaxed">
                  I've always believed children deserve to wear something special, something that makes them feel confident and cherished. That belief became the foundation of everything I create.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="aspect-[4/3] bg-gradient-soft rounded-2xl shadow-medium flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-3xl">👶</span>
                    </div>
                    <p className="font-inter text-lg opacity-90">Grandchildren wearing my first creations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 2 */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-1">
                <div className="aspect-[4/3] bg-gradient-hero rounded-2xl shadow-medium flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-3xl">✂️</span>
                    </div>
                    <p className="font-inter text-lg opacity-90">Hands sewing, selecting fabrics</p>
                  </div>
                </div>
              </div>
              <div className="order-2">
                <h2 className="font-playfair text-3xl font-bold text-foreground mb-6">
                  Why Handmade Matters
                </h2>
                <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
                  There's a world of difference between mass-produced clothing and pieces crafted by hand. Every stitch is made with intention, every seam reinforced with care, every detail considered for both beauty and practicality.
                </p>
                <p className="font-inter text-lg text-muted-foreground leading-relaxed">
                  The time and love I put into each piece means it will last through countless adventures, wash after wash, and even be passed down to younger siblings with pride.
                </p>
              </div>
            </div>
          </div>

          {/* Chapter 3 */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="font-playfair text-3xl font-bold text-foreground mb-6">
                  Modern Meets Traditional
                </h2>
                <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
                  Just because something is handmade doesn't mean it's old-fashioned. I stay current with trends, colors, and styles that kids love, while maintaining the timeless quality of traditional craftsmanship.
                </p>
                <p className="font-inter text-lg text-muted-foreground leading-relaxed">
                  Each design balances fashion with function – because what good is a beautiful dress if it can't handle a playground adventure?
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="aspect-[4/3] bg-gradient-warm rounded-2xl shadow-medium flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-3xl">🎨</span>
                    </div>
                    <p className="font-inter text-lg opacity-90">Design inspiration and sketches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 4 */}
          <div>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-1">
                <div className="aspect-[4/3] bg-gradient-soft rounded-2xl shadow-medium flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-3xl">💕</span>
                    </div>
                    <p className="font-inter text-lg opacity-90">Happy customers and children</p>
                  </div>
                </div>
              </div>
              <div className="order-2">
                <h2 className="font-playfair text-3xl font-bold text-foreground mb-6">
                  The Business of Joy
                </h2>
                <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
                  What started as making clothes for my own grandchildren has grown into something beautiful – the opportunity to share that same love and quality with families across Australia.
                </p>
                <p className="font-inter text-lg text-muted-foreground leading-relaxed">
                  When I see a child wearing one of my creations, spinning in a dress or confidently wearing a special outfit, I know I've succeeded. That joy is what drives every design, every stitch, every carefully packaged order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            What Guides Everything I Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-xl shadow-soft">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{value.icon}</span>
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="font-inter text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-foreground mb-6">
              From Design to Delivery
            </h2>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Every piece follows the same careful process, ensuring consistent quality and attention to detail
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  {step.step}
                </div>
                <h3 className="font-inter font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="font-inter text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            What Families Are Saying
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-soft">
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-brand-mustard text-lg">⭐</span>
                    ))}
                  </div>
                  <p className="font-inter text-muted-foreground italic mb-4">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-soft rounded-full"></div>
                  <div>
                    <p className="font-inter font-semibold text-foreground">{testimonial.name}</p>
                    <p className="font-inter text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-primary-foreground mb-6">
            Ready to Find Something Special?
          </h2>
          <p className="font-inter text-lg text-primary-foreground/90 mb-8">
            Discover beautiful, handmade pieces that will become treasured parts of your child's wardrobe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Shop New Arrivals
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              View Collections
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;