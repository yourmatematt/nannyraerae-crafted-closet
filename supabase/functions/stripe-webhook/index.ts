import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature provided')
    }

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook received:', event.type)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const metadata = paymentIntent.metadata

      console.log('Payment succeeded for session:', metadata.session_id)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_payment_intent_id: paymentIntent.id,
          session_id: metadata.session_id,
          customer_email: metadata.customer_email,
          customer_name: metadata.customer_name,
          total_amount: metadata.total,
          status: 'completed',
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        throw orderError
      }

      console.log('Order created:', order.id)

      // Get cart items from reservations
      const { data: reservations } = await supabase
        .from('cart_reservations')
        .select('product_id')
        .eq('session_id', metadata.session_id)
        .eq('status', 'active')

      if (reservations && reservations.length > 0) {
        // Create order items
        const orderItems = reservations.map(r => ({
          order_id: order.id,
          product_id: r.product_id,
          price: 0, // Price will be fetched from products table if needed
        }))

        await supabase.from('order_items').insert(orderItems)

        // Update reservations
        await supabase
          .from('cart_reservations')
          .update({ status: 'completed', is_expired: false })
          .eq('session_id', metadata.session_id)

        // Update products
        for (const reservation of reservations) {
          await supabase
            .from('products')
            .update({
              reserved_until: null,
              reserved_by_session: null,
              stock_status: 'sold',
            })
            .eq('id', reservation.product_id)
        }

        console.log('Updated products and reservations')
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object
      const metadata = paymentIntent.metadata

      console.log('Payment failed for session:', metadata.session_id)

      // Get reservations
      const { data: reservations } = await supabase
        .from('cart_reservations')
        .select('product_id')
        .eq('session_id', metadata.session_id)

      if (reservations && reservations.length > 0) {
        // Release reservations
        await supabase
          .from('cart_reservations')
          .update({ status: 'expired', is_expired: true })
          .eq('session_id', metadata.session_id)

        // Release products
        for (const reservation of reservations) {
          await supabase
            .from('products')
            .update({
              reserved_until: null,
              reserved_by_session: null,
            })
            .eq('id', reservation.product_id)
        }

        console.log('Released reservations after payment failure')
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})