import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const Cart = () => {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, removeFromCart } = useCart();

  const shipping = 12.00; // Standard flat-rate shipping
  const total = subtotal + shipping;

  // Fetch product descriptions for cart items that don't have them
  const productIds = items.filter(item => !item.description || !item.description.trim()).map(item => item.productId);

  const { data: productDescriptions = {} } = useQuery({
    queryKey: ['cartProductDescriptions', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};

      const { data, error } = await supabase
        .from('products')
        .select('id, description')
        .in('id', productIds);

      if (error) {
        console.error('Error fetching product descriptions:', error);
        return {};
      }

      // Convert to object for easy lookup
      const descriptionsMap: { [key: string]: string } = {};
      data?.forEach(product => {
        descriptionsMap[product.id.toString()] = product.description || '';
      });

      return descriptionsMap;
    },
    enabled: productIds.length > 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const getItemDescription = (item: any) => {
    // First check if the item already has a description
    if (item.description && item.description.trim()) {
      return item.description;
    }

    // Otherwise, check if we fetched it from the database
    const fetchedDescription = productDescriptions[item.productId];
    if (fetchedDescription && fetchedDescription.trim()) {
      return fetchedDescription;
    }

    // Fallback to default text
    return 'One-of-a-kind piece';
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Navigate to /checkout page instead of Stripe redirect
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className={cn(
        "min-h-screen bg-gray-50"
      )}>
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-playfair text-3xl font-bold mb-4" style={{ color: '#8E5A3B' }}>
              Your cart is empty
            </h1>
            <p className="font-inter text-lg text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="font-inter font-semibold"
            >
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#8E5A3B' }}>
            Shopping Cart
          </h1>
          <p className="font-inter text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-playfair text-xl font-semibold text-foreground">
                  Cart Items
                </h2>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-foreground mb-1">
                        {item.name}
                      </h3>
                      <p className="font-inter text-lg font-bold text-primary mb-3">
                        {formatCurrency(item.price)}
                      </p>

                      {/* Product Description and Remove Item */}
                      <div className="flex items-center gap-3">
                        <span className="font-inter text-sm text-muted-foreground">
                          {getItemDescription(item)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-inter text-lg font-bold text-foreground">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden sticky top-8">
              <div className="p-6 border-b border-border">
                <h2 className="font-playfair text-xl font-semibold text-foreground">
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="font-inter text-muted-foreground">Subtotal</span>
                  <span className="font-inter font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-inter text-muted-foreground">Shipping</span>
                  <span className="font-inter font-medium text-foreground">
                    {formatCurrency(shipping)}
                  </span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-inter text-lg font-semibold text-foreground">Total</span>
                    <span className="font-inter text-lg font-bold text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 space-y-3">
                <Button
                  className="w-full font-inter font-semibold"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-inter font-medium"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;