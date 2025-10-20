import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");

  // Pages where newsletter should NOT be shown
  const excludeNewsletterPages = ["/about", "/collections"];
  const showNewsletter = !excludeNewsletterPages.includes(location.pathname);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <>
      {/* Newsletter Section — uses primary (sage) */}
      {showNewsletter && (
        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

            <form onSubmit={handleNewsletterSubmit} className="max-w-lg mx-auto">
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

            <p className="mt-6 text-sm font-inter text-primary-foreground/70">
              Join 2,000+ families who love exclusive handmade pieces ✨
            </p>
          </div>
        </section>
      )}

      {/* Footer — earthy deep eucalyptus */}
      <footer className="bg-[hsl(130_18%_18%)] text-[hsl(43_50%_98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <div className="pt-12 pb-8 border-b border-white/10">
            <div className="flex justify-center">
              <img
                src="https://kqshrevhtrusxrwkgdmd.supabase.co/storage/v1/object/public/brand-assets/logo/logo-dark.png"
                alt="Nanny Rae Rae's Handmade Children's Clothing"
                className="h-20 md:h-24 lg:h-28 w-auto object-contain cursor-pointer"
                loading="lazy"
                onClick={() => navigate('/')}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
                }}
              />
              <div style={{ display: "none" }} className="text-center cursor-pointer" onClick={() => navigate('/')}>
                <h3 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold">
                  Nanny Rae Rae&apos;s
                </h3>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="font-playfair text-xl font-bold mb-4">About Us</h3>
              <p className="font-inter text-white/80 mb-6 leading-relaxed">
                Modern handmade fashion for little ones. Each piece crafted with love and designed to create lasting memories.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-playfair text-lg font-semibold mb-4">Shop</h4>
              <ul className="space-y-3 font-inter text-white/80">
                <li><button onClick={() => navigate('/new-arrivals')} className="hover:text-white transition-colors text-left">New Arrivals</button></li>
                <li><button onClick={() => navigate('/new-arrivals')} className="hover:text-white transition-colors text-left">Best Sellers</button></li>
                <li><button onClick={() => navigate('/shop/age/3mths')} className="hover:text-white transition-colors text-left">Baby (3-9m)</button></li>
                <li><button onClick={() => navigate('/shop/age/1yr')} className="hover:text-white transition-colors text-left">Toddler (1-2yrs)</button></li>
                <li><button onClick={() => navigate('/shop/age/3yrs')} className="hover:text-white transition-colors text-left">Kids (3-5yrs)</button></li>
                <li><button onClick={() => navigate('/gifts')} className="hover:text-white transition-colors text-left">Gift Ideas</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-playfair text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-3 font-inter text-white/80">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left">Size Guide</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left">Care Instructions</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left">Shipping & Returns</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left">FAQs</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors text-left">Quality Guarantee</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-playfair text-lg font-semibold mb-4">Get in Touch</h4>
              <div className="space-y-4 font-inter text-white/80">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 text-white/60" />
                  <div>
                    <p className="text-white">hello@nannyraeraes.com.au</p>
                    <p className="text-sm">We&apos;d love to hear from you!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                 
                
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-white/60" />
                  <div>
                    <p className="text-white">Mallacoota, Australia</p>
                    <p className="text-sm">Proudly Australian made</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <p className="font-inter text-white/80 text-center lg:text-left">
                © 2024 Handmade by Nanny Rae Rae&apos;s. All rights reserved.
              </p>

              <div className="flex items-center gap-6 text-white/70 text-sm font-inter">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[hsl(130_30%_60%)]"></span>
                  Australian Made
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[hsl(190_35%_55%)]"></span>
                  Secure Payments
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[hsl(278_35%_60%)]"></span>
                  Free Shipping $100+
                </span>
              </div>

              <div className="flex gap-6 font-inter text-white/80 text-sm">
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">Terms of Service</button>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
