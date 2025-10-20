import { User, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/components/auth/LoginModal";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();

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
                src="https://kqshrevhtrusxrwkgdmd.supabase.co/storage/v1/object/public/brand-assets/logo/logo-light.png"
                alt="Nanny Rae Rae's Handmade Children's Clothing"
                className="h-10 md:h-12 lg:h-14 w-auto object-contain"
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

              {/* Shop By Size dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="font-inter font-medium text-foreground hover:text-primary flex items-center gap-1"
                >
                  Shop By Size <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <Link
                      to="/new-arrivals?size=3mths"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      3 Months
                    </Link>
                    <Link
                      to="/new-arrivals?size=6mths"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      6 Months
                    </Link>
                    <Link
                      to="/new-arrivals?size=9mths"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      9 Months
                    </Link>
                    <Link
                      to="/new-arrivals?size=1yr"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      1 Year
                    </Link>
                    <Link
                      to="/new-arrivals?size=2yrs"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      2 Years
                    </Link>
                    <Link
                      to="/new-arrivals?size=3yrs"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      3 Years
                    </Link>
                    <Link
                      to="/new-arrivals?size=4yrs"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      4 Years
                    </Link>
                    <Link
                      to="/new-arrivals?size=5yrs"
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-md"
                    >
                      5 Years
                    </Link>
                  </div>
                </div>
              </div>

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


              {/* Account */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary relative"
                onClick={() => setIsLoginModalOpen(true)}
                aria-label={user ? "My Account" : "Login"}
              >
                <User className="h-5 w-5" />
                {user && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
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
                <div className="flex flex-col">
                  <span className="px-4 py-2 text-sm font-medium text-foreground border-b border-border mb-2">Shop By Size</span>
                  <Link
                    to="/new-arrivals?size=3mths"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    3 Months
                  </Link>
                  <Link
                    to="/new-arrivals?size=6mths"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    6 Months
                  </Link>
                  <Link
                    to="/new-arrivals?size=9mths"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    9 Months
                  </Link>
                  <Link
                    to="/new-arrivals?size=1yr"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    1 Year
                  </Link>
                  <Link
                    to="/new-arrivals?size=2yrs"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    2 Years
                  </Link>
                  <Link
                    to="/new-arrivals?size=3yrs"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    3 Years
                  </Link>
                  <Link
                    to="/new-arrivals?size=4yrs"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    4 Years
                  </Link>
                  <Link
                    to="/new-arrivals?size=5yrs"
                    className="px-4 py-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    5 Years
                  </Link>
                </div>
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navigation;