import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Mail, MapPin, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface Order {
  id: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postcode: string;
  shipping_country: string;
  subtotal: number;
  gst: number;
  shipping_cost: number;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { items } = useCart();

  // Fetch order details
  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId
  });

  // Fetch order items
  const { data: orderItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!orderId
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatAddress = (order: Order) => {
    const addressParts = [
      order.shipping_address_line1,
      order.shipping_address_line2,
      order.shipping_city,
      order.shipping_state,
      order.shipping_postcode,
      order.shipping_country
    ].filter(Boolean);

    return addressParts.join(', ');
  };

  if (orderLoading || itemsLoading) {
    return (
      <div className={cn(
        "min-h-screen bg-gray-50",
        items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
      )}>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
              Loading your order confirmation...
            </h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className={cn(
        "min-h-screen bg-gray-50",
        items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
      )}>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the order you're looking for. Please check your order confirmation email or contact support.
            </p>
            <Button onClick={() => navigate('/collection')}>
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      items.length > 0 ? "pt-[152px] sm:pt-[128px] lg:pt-[144px]" : ""
    )}>
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#8E5A3B' }}>
            Thank you for your order!
          </h1>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>Order confirmation has been sent to {order.customer_email}</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Order Number: <span className="font-bold text-primary">#{order.id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          {formatCurrency(item.product_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.product_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {order.shipping_cost > 0 ? formatCurrency(order.shipping_cost) : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST</span>
                    <span>{formatCurrency(order.gst)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Customer</h4>
                    <p className="text-gray-600">
                      {order.customer_first_name} {order.customer_last_name}
                    </p>
                    <p className="text-gray-600">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-gray-600">{order.customer_phone}</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Shipping Address</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {formatAddress(order)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Order Date</span>
                      <span className="text-gray-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate('/collection')}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    // Placeholder for future order tracking feature
                    alert('Order tracking feature coming soon!');
                  }}
                >
                  View Order Status
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8 text-center">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">
              Thank you for choosing Nanny Rae Rae's!
            </h2>
            <p className="text-gray-700 mb-4 max-w-2xl mx-auto leading-relaxed">
              Your handcrafted pieces are being prepared with love and care.
              We'll send you updates as your order progresses, and you can expect
              your beautiful items to arrive within 5-7 business days.
            </p>
            <p className="text-sm text-gray-600">
              Questions about your order? Contact us at{' '}
              <a href="mailto:hello@bynannyraerae.com.au" className="text-primary hover:underline">
                hello@bynannyraerae.com.au
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;