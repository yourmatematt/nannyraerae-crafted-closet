import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { LogOut, Package, ChevronDown, ChevronUp, ShoppingBag, Calendar, CreditCard, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface AccountDashboardProps {
  user: User;
  onClose: () => void;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items: OrderItem[];
  shipping_address?: any;
  payment_method?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export function AccountDashboard({ user, onClose }: AccountDashboardProps) {
  const { signOut } = useAuth();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['customer-orders', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data as Order[];
    }
  });

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return <Badge className="bg-yellow-500 text-white">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500 text-white">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-600 text-white">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-foreground">My Account</h2>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata?.name || user.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="font-inter"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <h3 className="font-inter text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order History
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load orders. Please try again later.
            </AlertDescription>
          </Alert>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-inter font-semibold text-foreground mb-2">No orders yet</h4>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your order history here!
              </p>
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <Card key={order.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="font-inter text-base">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                          </span>
                          <span>{order.order_items?.length || 0} items</span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h5 className="font-inter font-medium mb-3">Items</h5>
                          <div className="space-y-2">
                            {order.order_items?.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                  {item.products?.image_url ? (
                                    <img
                                      src={item.products.image_url}
                                      alt={item.products.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-inter font-medium text-sm truncate">
                                    {item.products?.name || 'Product'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-sm font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional Info */}
                        {order.shipping_address && (
                          <div>
                            <h5 className="font-inter font-medium mb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Shipping Address
                            </h5>
                            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {typeof order.shipping_address === 'string'
                                ? order.shipping_address
                                : JSON.stringify(order.shipping_address)}
                            </div>
                          </div>
                        )}

                        {order.payment_method && (
                          <div>
                            <h5 className="font-inter font-medium mb-2 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Payment Method
                            </h5>
                            <div className="text-sm text-muted-foreground">
                              {order.payment_method}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}