import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { releaseReservation } from '@/lib/reservations';
import { Loader2, Lock, CreditCard, Truck, Shield, User } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { LoginModal } from '@/components/auth/LoginModal';
import { cn } from '@/lib/utils';

interface CustomerDetails {
  email: string;
  name: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const SHIPPING_COST = 12.00; // Fixed shipping cost
const TAX_RATE = 0.10; // 10% tax rate

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart, sessionId } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const { user, signOut } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    email: '',
    name: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'AU'
    }
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty. Redirecting to shop...');
      navigate('/collection');
    }
  }, [items, navigate]);

  // Autofill form when user is logged in
  useEffect(() => {
    if (user && user.email) {
      setCustomerDetails(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
      }));
    }
  }, [user]);

  // Calculate order summary
  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : SHIPPING_COST; // Free shipping over $100
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const orderSummary = calculateOrderSummary();

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCustomerDetails(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCustomerDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const { email, name, phone, address } = customerDetails;

    if (!email || !name || !phone) {
      toast.error('Please fill in all required customer details');
      return false;
    }

    if (!address.line1 || !address.city || !address.state || !address.postalCode) {
      toast.error('Please fill in all required address fields');
      return false;
    }

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded. Please refresh the page.');
      return false;
    }

    return true;
  };

  const createPaymentIntent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(orderSummary.total * 100), // Convert to cents
          currency: 'aud',
          session_id: sessionId,
          customer_details: customerDetails,
          cart_items: items,
          order_summary: orderSummary
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  };

  const createOrder = async (paymentIntentId: string) => {
    try {
      // Create order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          payment_intent_id: paymentIntentId,
          customer_email: customerDetails.email,
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          shipping_address: customerDetails.address,
          subtotal: orderSummary.subtotal,
          shipping_cost: orderSummary.shipping,
          tax_amount: orderSummary.tax,
          total_amount: orderSummary.total,
          status: 'completed'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name,
        product_image: item.imageUrl
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Mark reservations as completed (rather than releasing them)
      for (const item of items) {
        await supabase
          .from('cart_reservations')
          .update({ is_expired: true })
          .eq('session_id', sessionId)
          .eq('product_id', item.productId);
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Create payment intent
      const { client_secret } = await createPaymentIntent();

      // Confirm payment with Stripe
      const cardElement = elements!.getElement(CardElement);
      const { error, paymentIntent } = await stripe!.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone,
            address: {
              line1: customerDetails.address.line1,
              line2: customerDetails.address.line2,
              city: customerDetails.address.city,
              state: customerDetails.address.state,
              postal_code: customerDetails.address.postalCode,
              country: customerDetails.address.country
            }
          }
        }
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create order in database
        const order = await createOrder(paymentIntent.id);

        // Clear cart
        await clearCart();

        // Success
        toast.success('Payment successful! Redirecting to confirmation...');
        navigate(`/order-confirmation/${order.id}`);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
    )}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold" style={{ color: '#8E5A3B' }}>Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - Left Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Secure Checkout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Authentication Section */}
                  {!user ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <p className="text-blue-900 font-medium">Returning customer? Sign in for faster checkout</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsLoginModalOpen(true)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Sign In
                        </Button>
                        <span className="text-sm text-blue-600 self-center">or continue as guest below</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-green-900 font-medium">Logged in as {user.email}</p>
                            <p className="text-sm text-green-700">Your information has been pre-filled below</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={signOut}
                          className="text-green-700 hover:bg-green-100"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerDetails.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={customerDetails.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          placeholder="+61 400 000 000"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="line1">Address Line 1 *</Label>
                        <Input
                          id="line1"
                          type="text"
                          value={customerDetails.address.line1}
                          onChange={(e) => handleInputChange('address.line1', e.target.value)}
                          required
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div>
                        <Label htmlFor="line2">Address Line 2</Label>
                        <Input
                          id="line2"
                          type="text"
                          value={customerDetails.address.line2}
                          onChange={(e) => handleInputChange('address.line2', e.target.value)}
                          placeholder="Apartment, suite, unit, etc. (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            type="text"
                            value={customerDetails.address.city}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            required
                            placeholder="Sydney"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            type="text"
                            value={customerDetails.address.state}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                            required
                            placeholder="NSW"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input
                            id="postalCode"
                            type="text"
                            value={customerDetails.address.postalCode}
                            onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                            required
                            placeholder="2000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                          },
                          hidePostalCode: true,
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Your payment information is secured by Stripe
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Complete Purchase ${orderSummary.total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Side */}
          <div>
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span>
                      {orderSummary.shipping === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `$${orderSummary.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST)</span>
                    <span>${orderSummary.tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)} AUD</span>
                </div>

                {orderSummary.shipping === 0 && (
                  <p className="text-sm text-green-600 text-center">
                    🎉 You qualified for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default Checkout;