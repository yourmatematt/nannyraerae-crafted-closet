import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const paymentIntentId = searchParams.get('payment_intent');
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();
  }, [clearCart]);

  if (!paymentIntentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="font-playfair text-4xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            <p className="font-inter text-lg text-muted-foreground mb-8">
              We couldn't find your payment information. Please contact support if you believe this is an error.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Confirmed Message */}
          <h1 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Order Confirmed! 🎉
          </h1>

          <p className="font-inter text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Thank you for your order! Your payment was successful and your order has been confirmed. You'll receive a tracking number via email within 1-2 business days once your item ships.
          </p>

          {/* Payment Confirmation */}
          <div className="bg-card rounded-2xl p-8 shadow-soft mb-8 max-w-2xl mx-auto">
            <h2 className="font-playfair text-2xl font-semibold text-foreground mb-6">
              Payment Confirmed ✅
            </h2>

            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-inter text-sm text-green-800 mb-1">
                Payment Intent ID:
              </p>
              <p className="font-inter font-mono text-sm text-green-900 break-all">
                {paymentIntentId}
              </p>
            </div>

            {sessionId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-inter text-sm text-blue-800 mb-1">
                  Session ID:
                </p>
                <p className="font-inter font-mono text-sm text-blue-900 break-all">
                  {sessionId}
                </p>
              </div>
            )}

            <div className="text-center">
              <div className="text-green-600 flex items-center gap-2 justify-center">
                <CheckCircle size={24} />
                <span className="font-medium">Order confirmed and received!</span>
              </div>
            </div>
          </div>

          {/* Order Complete Status */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
            <h3 className="font-playfair text-2xl font-bold text-green-900 mb-4">
              Order Complete
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mb-3">
                  <span className="text-sm font-bold text-green-800">✓</span>
                </div>
                <h4 className="font-inter font-semibold text-green-900 mb-2">Payment Processed</h4>
                <p className="font-inter text-sm text-green-700">
                  Your payment has been successfully processed by Stripe.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mb-3">
                  <span className="text-sm font-bold text-green-800">✓</span>
                </div>
                <h4 className="font-inter font-semibold text-green-900 mb-2">Order Confirmed</h4>
                <p className="font-inter text-sm text-green-700">
                  Your order has been confirmed and Nanny Rae Rae has been notified.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mb-3">
                  <span className="text-sm font-bold text-green-800">✓</span>
                </div>
                <h4 className="font-inter font-semibold text-green-900 mb-2">Email Sent</h4>
                <p className="font-inter text-sm text-green-700">
                  Order confirmation sent. Tracking number will arrive within 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next Timeline */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg mb-2">📦 What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✉️ <strong>Now:</strong> Order confirmation email sent</li>
              <li>🎨 <strong>1-2 days:</strong> Nanny Rae Rae handcrafts your order</li>
              <li>📮 <strong>2-3 days:</strong> Tracking number sent via email</li>
              <li>🏠 <strong>5-7 days:</strong> Delivered to your door</li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="font-inter font-semibold px-8"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;