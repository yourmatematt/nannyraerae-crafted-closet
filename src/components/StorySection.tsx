import { Button } from "@/components/ui/button";

const StorySection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-soft relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden shadow-medium relative">
              {/* Placeholder for sewing room image */}
              <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🧵</span>
                  </div>
                  <p className="font-inter text-lg opacity-90">Nanny Rae Rae&apos;s Sewing Room</p>
                </div>
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-coral/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-mustard/20 rounded-full blur-2xl"></div>
          </div>

          {/* Content Side */}
          <div>
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold mb-6" style={{ color: '#8E5A3B' }}>
              From My Sewing Room to Your Family
            </h2>
            
            <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
              It all started when I became a grandmother — but really, the story goes back even further.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
              I’ve been sewing for over 60 years. I first sat at a sewing machine with my grandmother when I was just 5 years old. Since then, I’ve made clothes for all of my children throughout their lives, always with one goal — to create garments that could handle the rough-and-tumble reality of childhood.
            </p>

            <p className="font-inter text-lg text-muted-foreground mb-6 leading-relaxed">
              Now as a grandmother, that same purpose continues — making clothing that isn’t just beautiful, but built to last, to be loved, to be handed down. Each piece is thoughtfully designed and carefully handmade in my home studio, using quality fabrics and sometimes recycled materials for truly unique pieces.
            </p>

            <Button 
              size="lg"
              className="font-inter font-semibold px-8 py-4 rounded-full shadow-medium hover:shadow-large transition-all duration-300"
            >
              Read My Full Story
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StorySection;
