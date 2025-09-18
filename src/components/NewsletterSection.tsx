import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Decorative elements */}
        <div className="relative">
          <div className="absolute -top-8 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -top-4 right-1/3 w-8 h-8 bg-white/20 rounded-full blur-lg"></div>
          
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold mb-4">
            Join the Nanny Rae Rae Family
          </h2>
        </div>
        
        <p className="font-inter text-lg lg:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Be the first to know about new designs, exclusive offers, and behind-the-scenes stories from the sewing room.
        </p>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-white focus:ring-white font-inter px-6 py-4 text-lg rounded-full"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-inter font-semibold px-8 py-4 text-lg rounded-full shadow-large hover:shadow-xl transition-all duration-300 whitespace-nowrap"
            >
              Subscribe
            </Button>
          </div>
        </form>

        {/* Benefits */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-inter text-primary-foreground/80">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
            <span>Exclusive early access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
            <span>Special subscriber discounts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
            <span>Crafting tips & stories</span>
          </div>
        </div>

        {/* Social proof */}
        <p className="mt-6 text-sm font-inter text-primary-foreground/70">
          Join 2,000+ families who love exclusive handmade pieces ✨
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;