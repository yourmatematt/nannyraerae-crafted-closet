import { Heart, Sparkles, Award, MapPin } from "lucide-react";

const ValueProps = () => {
  const values = [
    {
      icon: Heart,
      title: "Handmade with Love",
      description: "Every stitch is placed with care and attention to detail",
    },
    {
      icon: Sparkles,
      title: "Exclusive Designs",
      description: "Unique colour ways you won't find anywhere else",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Only the finest quality fabrics and materials",
    },
    {
      icon: MapPin,
      title: "Australian Made",
      description: "Proudly hand crafted in Australia",
    },
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4 group-hover:bg-secondary transition-colors duration-300">
                <value.icon className="h-8 w-8" />
              </div>
              
              <h3 className="font-playfair text-xl font-semibold text-foreground mb-2">
                {value.title}
              </h3>
              
              <p className="font-inter text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;