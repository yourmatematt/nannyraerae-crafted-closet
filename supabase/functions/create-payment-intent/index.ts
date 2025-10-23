import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  session_id: string;
  customer_details: {
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
  };
  cart_items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  order_summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Parse request body
    const {
      amount,
      currency,
      session_id,
      customer_details,
      cart_items,
      order_summary
    }: PaymentIntentRequest = await req.json()

    // Validate required fields
    if (!amount || !currency || !session_id || !customer_details?.email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is an integer (cents)
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        session_id,
        customer_email: customer_details.email,
        customer_name: customer_details.name,
        customer_phone: customer_details.phone,
        subtotal: order_summary.subtotal.toString(),
        shipping: order_summary.shipping.toString(),
        tax: order_summary.tax.toString(),
        total: order_summary.total.toString(),
        item_count: cart_items.length.toString(),
      },
      shipping: {
        name: customer_details.name,
        phone: customer_details.phone,
        address: {
          line1: customer_details.address.line1,
          line2: customer_details.address.line2 || undefined,
          city: customer_details.address.city,
          state: customer_details.address.state,
          postal_code: customer_details.address.postalCode,
          country: customer_details.address.country,
        },
      },
      receipt_email: customer_details.email,
    })

    // Log for debugging (remove in production)
    console.log('PaymentIntent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      session_id,
      customer_email: customer_details.email,
    })

    // Return client_secret to frontend
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating PaymentIntent:', error)

    return new Response(
      JSON.stringify({
        error: 'Failed to create payment intent',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})