import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h3 className="font-playfair text-2xl font-bold text-white mb-4">
              Nanny Rae Rae's
            </h3>
            <p className="font-inter text-background/80 mb-6 leading-relaxed">
              Modern handmade fashion for little ones. Each piece crafted with love and designed to create lasting memories.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-background/80 hover:text-white hover:bg-white/10"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-background/80 hover:text-white hover:bg-white/10"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-background/80 hover:text-white hover:bg-white/10"
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-4">
              Shop
            </h4>
            <ul className="space-y-3 font-inter text-background/80">
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Baby (0-12m)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Toddler (1-3yrs)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kids (3-10yrs)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gift Ideas</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-4">
              Support
            </h4>
            <ul className="space-y-3 font-inter text-background/80">
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Care Instructions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quality Guarantee</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-4">
              Get in Touch
            </h4>
            <div className="space-y-4 font-inter text-background/80">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-background/60" />
                <div>
                  <p className="text-white">hello@nannyraeraes.com.au</p>
                  <p className="text-sm">We'd love to hear from you!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-background/60" />
                <div>
                  <p className="text-white">+61 4XX XXX XXX</p>
                  <p className="text-sm">Mon-Fri, 9am-5pm AEST</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-background/60" />
                <div>
                  <p className="text-white">Melbourne, Australia</p>
                  <p className="text-sm">Proudly Australian made</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <p className="font-inter text-background/80 text-center lg:text-left">
              © 2024 Handmade by Nanny Rae Rae's. All rights reserved.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-background/60 text-sm font-inter">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Australian Made
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Free Shipping $100+
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex gap-6 font-inter text-background/80 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;