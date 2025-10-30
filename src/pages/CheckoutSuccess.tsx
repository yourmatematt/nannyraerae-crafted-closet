import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [pollCount, setPollCount] = useState(0);

  const paymentIntentId = searchParams.get('payment_intent');
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();
  }, [clearCart]);

  // Poll for order creation by payment intent ID
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-by-payment-intent', paymentIntentId],
    queryFn: async () => {
      if (!paymentIntentId) throw new Error('No payment intent ID');

      console.log('Polling for order with payment intent:', paymentIntentId);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (error) {
        console.log('Order not found yet, continuing to poll...');
        throw error;
      }

      console.log('Order found:', data);
      return data;
    },
    enabled: !!paymentIntentId,
    retry: true,
    retryDelay: 2000, // Poll every 2 seconds
    refetchInterval: 2000, // Keep polling
    refetchIntervalInBackground: true,
  });

  // Redirect to order confirmation once order is found
  useEffect(() => {
    if (order?.id) {
      console.log('Order created! Redirecting to confirmation:', order.id);
      toast.success('Order confirmed! Redirecting to order details...');
      setTimeout(() => {
        navigate(`/order-confirmation/${order.id}`);
      }, 1000);
    }
  }, [order, navigate]);

  // Timeout after 60 seconds of polling
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!order) {
        console.log('Order creation timeout - showing fallback');
        toast.error('Order processing is taking longer than expected. Please check your email for confirmation.');
      }
    }, 60000); // 60 seconds

    return () => clearTimeout(timeout);
  }, [order]);

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
          {/* Processing Icon */}
          <div className="w-20 h-20 mx-auto mb-8 bg-blue-100 rounded-full flex items-center justify-center">
            {order ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
          </div>

          {/* Processing Message */}
          <h1 className="font-playfair text-4xl font-bold text-foreground mb-4">
            {order ? 'Order Confirmed!' : 'Processing Your Order...'}
          </h1>

          <p className="font-inter text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {order
              ? 'Your order has been confirmed and you\'ll be redirected to your order details shortly.'
              : 'Your payment was successful! We\'re now processing your order and will redirect you to the confirmation page once it\'s ready.'
            }
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
              {order ? (
                <p className="text-green-600 font-medium">
                  ✅ Order created successfully!
                </p>
              ) : (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="font-medium">Creating your order...</p>
                </div>
              )}
            </div>
          </div>

          {/* What's Happening */}
          {!order && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
              <h3 className="font-playfair text-2xl font-bold text-blue-900 mb-4">
                What's happening now?
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mb-3">
                    <span className="text-sm font-bold text-green-800">✓</span>
                  </div>
                  <h4 className="font-inter font-semibold text-blue-900 mb-2">Payment Processed</h4>
                  <p className="font-inter text-sm text-blue-700">
                    Your payment has been successfully processed by Stripe.
                  </p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mb-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-800" />
                  </div>
                  <h4 className="font-inter font-semibold text-blue-900 mb-2">Creating Order</h4>
                  <p className="font-inter text-sm text-blue-700">
                    We're now creating your order record and reserving your items.
                  </p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <span className="text-sm font-bold text-gray-600">3</span>
                  </div>
                  <h4 className="font-inter font-semibold text-blue-900 mb-2">Confirmation</h4>
                  <p className="font-inter text-sm text-blue-700">
                    You'll receive your order confirmation via email shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="font-inter font-semibold px-8"
            >
              Continue Shopping
            </Button>
            {order && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                className="font-inter font-medium px-8"
              >
                View Order Details
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;