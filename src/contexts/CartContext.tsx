import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getOrCreateSessionId } from '@/lib/session';
import { createReservation, releaseReservation, getSessionReservations } from '@/lib/reservations';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  quantity: number;
  sessionId?: string;
  reservedUntil?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'id' | 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addToCart: (product: Omit<CartItem, 'id' | 'quantity' | 'sessionId' | 'reservedUntil'>) => Promise<void>;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  clearStaleData: () => void;
  sessionId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateTotals = (items: CartItem[]) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return { itemCount, subtotal };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_TO_CART': {
      // Add new item (duplicate checking is now done in addToCart function)
      const newItem: CartItem = {
        ...action.payload,
        id: `${action.payload.productId}-${Date.now()}`,
        quantity: 1,
      };
      newItems = [...state.items, newItem];
      break;
    }

    case 'REMOVE_FROM_CART':
      newItems = state.items.filter(item => item.id !== action.payload);
      break;


    case 'CLEAR_CART':
      newItems = [];
      break;

    case 'LOAD_CART':
      newItems = action.payload;
      break;

    default:
      return state;
  }

  const totals = calculateTotals(newItems);

  return {
    items: newItems,
    ...totals,
  };
};

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  // Initialize session ID
  useEffect(() => {
    const currentSessionId = getOrCreateSessionId();
    setSessionId(currentSessionId);
  }, []);

  // Load cart from localStorage on mount with session validation
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = localStorage.getItem('nannyraerae-cart');
      if (savedCart && sessionId) {
        try {
          const cartItems = JSON.parse(savedCart);

          // Validate cart items against current session reservations
          const validatedItems = [];
          for (const item of cartItems) {
            if (item.sessionId === sessionId && item.reservedUntil) {
              // Force UTC parsing by adding 'Z' if not present
              const utcTimeString = item.reservedUntil.endsWith('Z') ? item.reservedUntil : item.reservedUntil + 'Z';
              const reservedUntil = new Date(utcTimeString);
              const now = new Date();

              console.log('🔄 Cart validation on load:', {
                itemName: item.name,
                originalReservedUntil: item.reservedUntil,
                utcTimeString,
                parsedReservedUntil: reservedUntil.toISOString(),
                currentTime: now.toISOString(),
                isValid: reservedUntil > now,
                timeDiff: reservedUntil.getTime() - now.getTime()
              });

              if (reservedUntil > now) {
                validatedItems.push(item);
              } else {
                // Release expired reservation
                console.log('💀 Releasing expired cart item:', item.name);
                await releaseReservation(sessionId, item.productId);
              }
            }
          }

          dispatch({ type: 'LOAD_CART', payload: validatedItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    };

    if (sessionId) {
      loadCart();
    }
  }, [sessionId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('nannyraerae-cart', JSON.stringify(state.items));
    }
  }, [state.items, sessionId]);

  const addToCart = async (product: Omit<CartItem, 'id' | 'quantity' | 'sessionId' | 'reservedUntil'>) => {
    if (!sessionId) {
      toast.error('Session not initialized. Please refresh the page.');
      return;
    }

    // First, remove any existing item with the same productId to clear stale data
    const existingItem = state.items.find(cartItem => cartItem.productId === product.productId);

    if (existingItem) {
      console.log('🔄 Removing existing item to refresh with new reservation:', existingItem.name);
      // Remove the existing item first to clear any stale expiry times
      dispatch({ type: 'REMOVE_FROM_CART', payload: existingItem.id });
    }

    // Create reservation first
    toast.loading('Adding to cart...', { id: 'add-to-cart' });

    try {
      const reservationResult = await createReservation(sessionId, product.productId);

      if (!reservationResult.success) {
        toast.error(reservationResult.message, { id: 'add-to-cart' });
        return;
      }

      // ONLY use the fresh database expiry time - no fallback to prevent stale data
      const dbExpiryTime = reservationResult.reservation?.expires_at;

      if (!dbExpiryTime) {
        throw new Error('No expiry time received from database reservation');
      }

      const reservedUntil = dbExpiryTime;

      console.log('🛒 CartContext - Setting cart item expiry:', {
        productName: product.name,
        productId: product.productId,
        currentTime: new Date().toISOString(),
        dbExpiryTime,
        reservedUntil,
        freshFromDatabase: true,
        reservationId: reservationResult.reservation?.id
      });

      const cartItem = {
        ...product,
        sessionId,
        reservedUntil
      };

      dispatch({ type: 'ADD_TO_CART', payload: cartItem });

      toast.success(`Added ${product.name} to cart! Reserved for 15 minutes.`, {
        id: 'add-to-cart',
        duration: 4000,
        action: {
          label: 'View Cart',
          onClick: () => window.location.href = '/cart'
        }
      });

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.', { id: 'add-to-cart' });
    }
  };

  const removeFromCart = async (id: string) => {
    // Find the item to remove
    const itemToRemove = state.items.find(item => item.id === id);

    if (itemToRemove && sessionId) {
      // Release the reservation
      await releaseReservation(sessionId, itemToRemove.productId);
    }

    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };


  const clearCart = async () => {
    // Release all reservations for this session
    if (sessionId) {
      for (const item of state.items) {
        await releaseReservation(sessionId, item.productId);
      }
    }

    // Clear localStorage to remove any stale data
    localStorage.removeItem('nannyraerae-cart');

    dispatch({ type: 'CLEAR_CART' });
  };

  const clearStaleData = () => {
    console.log('🧹 Clearing all stale cart data');
    localStorage.removeItem('nannyraerae-cart');
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        clearCart,
        clearStaleData,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};