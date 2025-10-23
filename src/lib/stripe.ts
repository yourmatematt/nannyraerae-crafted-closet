import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
}

// Create a promise that resolves to the Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Export the stripe promise for use in components
export default getStripe;