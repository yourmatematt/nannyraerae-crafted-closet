import Stripe from 'npm:stripe@latest'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

Deno.serve(async (req) => {
  // OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cartItems }: { cartItems: CartItem[] } = await req.json()

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart items are required')
    }

    // Create line items from cart
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          // Only include images if it's a valid HTTPS URL
          ...(item.imageUrl && item.imageUrl.startsWith('http') ? { images: [item.imageUrl] } : {}),
          metadata: {
            productId: item.productId,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Calculate subtotal and add flat-rate shipping
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = 12.00 // Flat-rate shipping $12 AUD
    const shippingInCents = Math.round(shipping * 100)

    // Add shipping as a line item
    line_items.push({
      price_data: {
        currency: 'aud',
        product_data: {
          name: 'Standard Shipping',
          description: 'Flat-rate shipping within Australia',
        },
        unit_amount: shippingInCents,
      },
      quantity: 1,
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      billing_address_collection: 'required',
      metadata: {
        cartItemsCount: cartItems.length.toString(),
        subtotalAUD: subtotal.toString(),
        shippingAUD: shipping.toString(),
      },
    })

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Checkout session creation error:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})