import { supabase } from './supabase';
import { CartItem } from '@/contexts/CartContext';

export interface CheckoutSessionData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export async function createCheckoutSession(cartItems: any[]) {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { cartItems }
    })

    if (error) throw error

    if (data?.url) {
      window.location.href = data.url
    } else {
      throw new Error('No checkout URL returned')
    }

    return data
  } catch (error) {
    console.error('Checkout error:', error)
    throw error
  }
}

// Legacy function for backward compatibility
export const createCheckoutSessionAPI = async (sessionData: CheckoutSessionData) => {
  return createCheckoutSession(sessionData.items);
};