import { Button } from "@/components/ui/button";

const FeaturedCollections = () => {
  const collections = [
    {
      title: "New Season Arrivals",
      subtitle: "Fresh designs for autumn",
      bgColor: "bg-gradient-hero",
      textColor: "text-white",
    },
    {
      title: "Best Sellers",
      subtitle: "Customer favorites",
      bgColor: "bg-gradient-warm",
      textColor: "text-white",
    },
    {
      title: "Exclusive Designs",
      subtitle: "One-of-a-kind pieces",
      bgColor: "bg-accent",
      textColor: "text-foreground",
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Discover Our Collections
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Each collection tells a unique story, crafted with love and attention to detail
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {collections.map((collection, index) => (
          <div
            key={index}
            className={`${collection.bgColor} rounded-2xl p-8 lg:p-12 min-h-[400px] flex flex-col justify-between group hover:scale-105 transition-transform duration-300 shadow-medium hover:shadow-large`}
          >
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
              className={`self-start border-current ${collection.textColor} hover:bg-current hover:text-background font-inter font-semibold px-6 py-3 rounded-full transition-all duration-300`}
            >
              Shop Now
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollections;