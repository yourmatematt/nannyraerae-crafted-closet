import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 mx-auto mb-8 bg-orange-100 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-orange-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Payment Cancelled
          </h1>
          <p className="font-inter text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            No worries! Your payment was cancelled and no charges were made. Your cart items are still saved and waiting for you.
          </p>

          {/* Reassurance Card */}
          <div className="bg-card rounded-2xl p-8 shadow-soft mb-8 max-w-2xl mx-auto">
            <h2 className="font-playfair text-2xl font-semibold text-foreground mb-6">
              What Happened?
            </h2>

            <div className="text-left space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-inter text-muted-foreground">
                  Your payment was safely cancelled - no charges were processed
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-inter text-muted-foreground">
                  All items remain in your cart for when you're ready
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-inter text-muted-foreground">
                  You can try checkout again or continue browsing our collection
                </p>
              </div>
            </div>
          </div>

          {/* Helpful Actions */}
          <div className="bg-muted/30 rounded-2xl p-8 mb-8">
            <h3 className="font-playfair text-xl font-semibold text-foreground mb-6">
              Need Help?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-inter font-semibold text-foreground mb-2">
                  Payment Issues?
                </h4>
                <p className="font-inter text-sm text-muted-foreground mb-3">
                  If you experienced any payment problems, try using a different payment method or contact your bank.
                </p>
              </div>
              <div>
                <h4 className="font-inter font-semibold text-foreground mb-2">
                  Questions About Items?
                </h4>
                <p className="font-inter text-sm text-muted-foreground mb-3">
                  Check our size guide or read more about our handmade process before completing your order.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/cart')}
              className="font-inter font-semibold px-8 flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Return to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="font-inter font-medium px-8 flex items-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Continue Shopping
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="font-inter text-sm text-muted-foreground mb-4">
              Still having trouble? We're here to help!
            </p>
            <Button
              variant="ghost"
              onClick={() => navigate('/about')}
              className="font-inter text-primary hover:text-primary/80"
            >
              Contact Nanny Rae Rae
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutCancel;