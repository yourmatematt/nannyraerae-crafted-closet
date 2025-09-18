import { Search, User, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top promotional banner */}
      <div className="bg-gradient-hero text-white py-2 px-4 text-center text-sm font-medium">
        FREE SHIPPING ON ORDERS OVER $100 AUD 🎉
      </div>

      {/* Main navigation */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-primary">
                Nanny Rae Rae's
              </h1>
              <p className="text-xs text-muted-foreground font-inter">handmade with love</p>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Button variant="ghost" className="font-inter font-medium text-foreground hover:text-primary">
                New Arrivals
              </Button>
              
              {/* Shop by Age dropdown */}
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  className="font-inter font-medium text-foreground hover:text-primary flex items-center gap-1"
                >
                  Shop by Age <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md">0-3 months</a>
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md">3-12 months</a>
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md">1-3 years</a>
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md">3-5 years</a>
                    <a href="#" className="block px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md">5-10 years</a>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="font-inter font-medium text-foreground hover:text-primary">
                Collections
              </Button>
              <Button variant="ghost" className="font-inter font-medium text-foreground hover:text-primary">
                About
              </Button>
              <Button variant="ghost" className="font-inter font-medium text-foreground hover:text-primary">
                Gift Ideas
              </Button>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Currency selector */}
              <div className="hidden sm:block">
                <Button variant="ghost" size="sm" className="font-inter text-sm text-muted-foreground">
                  AUD
                </Button>
              </div>

              {/* Search */}
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <Search className="h-5 w-5" />
              </Button>

              {/* Account */}
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <User className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  2
                </span>
              </Button>

              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="flex flex-col space-y-1">
                  <span className="w-5 h-0.5 bg-foreground"></span>
                  <span className="w-5 h-0.5 bg-foreground"></span>
                  <span className="w-5 h-0.5 bg-foreground"></span>
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-3">
                <Button variant="ghost" className="justify-start font-inter font-medium text-foreground">
                  New Arrivals
                </Button>
                <Button variant="ghost" className="justify-start font-inter font-medium text-foreground">
                  Shop by Age
                </Button>
                <Button variant="ghost" className="justify-start font-inter font-medium text-foreground">
                  Collections
                </Button>
                <Button variant="ghost" className="justify-start font-inter font-medium text-foreground">
                  About
                </Button>
                <Button variant="ghost" className="justify-start font-inter font-medium text-foreground">
                  Gift Ideas
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Navigation;