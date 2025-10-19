import { Search, User, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top promotional banner */}
      <div className="bg-gradient-hero text-white py-2 px-4 text-center text-sm font-medium relative z-40">
        FREE SHIPPING ON ORDERS OVER $100 AUD 🎉
      </div>

      {/* Main navigation */}
      <header className={cn(
        "sticky top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-background border-b border-border"
      )}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/logo.png" // Will be updated with Supabase Storage URL later
                alt="Nanny Rae Rae's"
                className="h-12 lg:h-16"
                onError={(e) => {
                  // Fallback to text if logo image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }}>
                <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-primary">
                  Nanny Rae Rae's
                </h1>
                <p className="text-xs text-muted-foreground font-inter">handmade with love</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Button
                variant="ghost"
                className="font-inter font-medium text-foreground hover:text-primary"
                onClick={() => navigate('/new-arrivals')}
              >
                New Arrivals
              </Button>

              {/* Shop by Age dropdown - REMOVED */}
              {/*
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="font-inter font-medium text-foreground hover:text-primary flex items-center gap-1"
                >
                  Shop by Age <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                      onClick={() => navigate('/shop/age/0-3m')}
                    >
                      0-3 months
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                      onClick={() => navigate('/shop/age/3-12m')}
                    >
                      3-12 months
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                      onClick={() => navigate('/shop/age/1-3y')}
                    >
                      1-3 years
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                      onClick={() => navigate('/shop/age/3-5y')}
                    >
                      3-5 years
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                      onClick={() => navigate('/shop/age/5-10y')}
                    >
                      5-10 years
                    </button>
                  </div>
                </div>
              </div>
              */}

              <Button
                variant="ghost"
                className="font-inter font-medium text-foreground hover:text-primary"
                onClick={() => navigate('/collections')}
              >
                Collection
              </Button>
              <Button
                variant="ghost"
                className="font-inter font-medium text-foreground hover:text-primary"
                onClick={() => navigate('/gifts')}
              >
                Gift Ideas
              </Button>
              <Button
                variant="ghost"
                className="font-inter font-medium text-foreground hover:text-primary"
                onClick={() => navigate('/about')}
              >
                About
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
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
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
            <div className={cn(
              "lg:hidden border-t py-4",
              isScrolled
                ? "border-border/50 bg-white/80 backdrop-blur-md"
                : "border-border bg-background"
            )}>
              <div className="flex flex-col space-y-3">
                <Button
                  variant="ghost"
                  className="justify-start font-inter font-medium text-foreground"
                  onClick={() => { navigate('/new-arrivals'); setIsMenuOpen(false); }}
                >
                  New Arrivals
                </Button>
                {/* Shop by Age - REMOVED */}
                {/*
                <Button
                  variant="ghost"
                  className="justify-start font-inter font-medium text-foreground"
                  onClick={() => { navigate('/shop/age/1-3y'); setIsMenuOpen(false); }}
                >
                  Shop by Age
                </Button>
                */}
                <Button
                  variant="ghost"
                  className="justify-start font-inter font-medium text-foreground"
                  onClick={() => { navigate('/collections'); setIsMenuOpen(false); }}
                >
                  Collections
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-inter font-medium text-foreground"
                  onClick={() => { navigate('/about'); setIsMenuOpen(false); }}
                >
                  About
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-inter font-medium text-foreground"
                  onClick={() => { navigate('/gifts'); setIsMenuOpen(false); }}
                >
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