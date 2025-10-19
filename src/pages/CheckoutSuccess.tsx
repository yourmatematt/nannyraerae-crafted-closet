import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();

    // Only show toast if we haven't shown it for this session
    if (sessionId) {
      const shownSessions = sessionStorage.getItem('shown_success_toasts') || '';

      if (!shownSessions.includes(sessionId)) {
        toast.success('Payment successful! Your order has been confirmed.', {
          duration: 4000
        });
        sessionStorage.setItem('shown_success_toasts', shownSessions + sessionId + ',');
      }
    }
  }, [clearCart, sessionId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Thank You Message */}
          <h1 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Thank You for Your Order!
          </h1>
          <p className="font-inter text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your payment was successful and your order is now being prepared with love in Nanny Rae Rae's sewing room.
          </p>

          {/* Order Details */}
          <div className="bg-card rounded-2xl p-8 shadow-soft mb-8 max-w-2xl mx-auto">
            <h2 className="font-playfair text-2xl font-semibold text-foreground mb-6">
              Order Confirmation
            </h2>

            {sessionId && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="font-inter text-sm text-muted-foreground mb-1">Order ID:</p>
                <p className="font-inter font-mono text-sm text-foreground">{sessionId}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-inter font-semibold text-foreground mb-2">
                    Handmade with Care
                  </h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Your items will be carefully crafted and quality checked before shipping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-inter font-semibold text-foreground mb-2">
                    Fast Shipping
                  </h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Expect your beautiful new clothes to arrive within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-soft rounded-2xl p-8 text-white mb-8">
            <h3 className="font-playfair text-2xl font-bold mb-4">
              What Happens Next?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h4 className="font-inter font-semibold mb-2">Order Processing</h4>
                <p className="font-inter text-sm opacity-90">
                  We'll send you an email confirmation within the next hour.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h4 className="font-inter font-semibold mb-2">Crafting</h4>
                <p className="font-inter text-sm opacity-90">
                  Your items will be lovingly made in our sewing room.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-sm font-bold">3</span>
                </div>
                <h4 className="font-inter font-semibold mb-2">Shipping</h4>
                <p className="font-inter text-sm opacity-90">
                  Track your package as it makes its way to your door.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="font-inter font-semibold px-8"
            >
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/about')}
              className="font-inter font-medium px-8"
            >
              Learn About Nanny Rae Rae
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;