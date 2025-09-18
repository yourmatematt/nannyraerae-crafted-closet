import { Button } from "@/components/ui/button";

const StorySection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden shadow-medium">
              {/* Placeholder for sewing room image */}
              <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🧵</span>
                  </div>
                  <p className="font-inter text-lg opacity-90">Nanny Rae Rae's Sewing Room</p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-coral/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-mustard/20 rounded-full blur-2xl"></div>
          </div>

          {/* Content Side */}
          <div>
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-foreground mb-6">
              From My Sewing Room to Your Family
            </h2>
            
            <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
              It all started when I became a grandmother. I wanted to create something special for my grandchildren – clothes that were not only beautiful but told a story of love and care.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
              Each piece is thoughtfully designed and carefully handcrafted in my home studio, using only the finest organic fabrics. I believe that children deserve clothes that are as unique and wonderful as they are.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button 
                size="lg"
                className="font-inter font-semibold px-8 py-4 rounded-full shadow-medium hover:shadow-large transition-all duration-300"
              >
                Read My Full Story
              </Button>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-brand-coral rounded-full border-2 border-background"></div>
                  <div className="w-10 h-10 bg-brand-mustard rounded-full border-2 border-background"></div>
                  <div className="w-10 h-10 bg-brand-sky rounded-full border-2 border-background"></div>
                </div>
                <span className="font-inter text-sm">Join 2,000+ happy families</span>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="mt-8 p-6 bg-card/50 rounded-xl border-l-4 border-primary">
              <p className="font-inter text-foreground italic mb-3">
                "Fashion-forward, not old-fashioned. Each piece tells a story of modern design meets traditional craftsmanship."
              </p>
              <cite className="font-playfair text-primary font-semibold not-italic">
                — Nanny Rae Rae
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;