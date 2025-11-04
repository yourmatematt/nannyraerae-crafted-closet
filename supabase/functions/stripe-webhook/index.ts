import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔧 Stripe Webhook Called:', {
    method: req.method,
    url: req.url,
    hasSignature: !!req.headers.get('stripe-signature'),
    timestamp: new Date().toISOString()
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only accept POST requests for webhook
  if (req.method !== 'POST') {
    console.error('❌ Webhook called with wrong method:', req.method)
    return new Response('Method not allowed', {
      status: 405,
      headers: {
        ...corsHeaders,
        'Allow': 'POST, OPTIONS'
      }
    })
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

      console.log('=== PAYMENT INTENT SUCCEEDED ===')
      console.log('Payment Intent ID:', paymentIntent.id)
      console.log('Metadata:', JSON.stringify(paymentIntent.metadata, null, 2))

      const metadata = paymentIntent.metadata
      const sessionId = metadata.session_id

      if (!sessionId) {
        console.error('No session_id in payment intent metadata')
        throw new Error('Missing session_id in payment intent metadata')
      }

      // Parse customer details from metadata
      const customerDetails = JSON.parse(metadata.customer_details || '{}')
      const orderSummary = JSON.parse(metadata.order_summary || '{}')

      // Split customer name
      const nameParts = customerDetails.name?.trim().split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      console.log('Creating order with details:', {
        sessionId,
        customerDetails,
        orderSummary,
        firstName,
        lastName
      })

      // Create order with proper schema
      const orderData = {
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address_line1: customerDetails.address?.line1,
        shipping_address_line2: customerDetails.address?.line2 || null,
        shipping_city: customerDetails.address?.city,
        shipping_state: customerDetails.address?.state,
        shipping_postcode: customerDetails.address?.postalCode,
        shipping_country: customerDetails.address?.country,
        subtotal: Number(orderSummary.subtotal || 0),
        gst_amount: Number(orderSummary.tax || 0),
        shipping_cost: Number(orderSummary.shipping || 0),
        total_amount: Number(orderSummary.total || 0),
        status: 'pending'
      }

      console.log('Order data to insert:', JSON.stringify(orderData, null, 2))

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        throw orderError
      }

      console.log('Order created successfully:', order.id)

      // Get cart items from metadata
      const cartItems = JSON.parse(metadata.cart_items || '[]')

      if (cartItems.length > 0) {
        console.log('Creating order items:', cartItems.length)

        // Create order items with proper schema
        const orderItems = cartItems.map((item: any) => ({
          order_id: order.id,
          product_id: item.productId,
          price_at_purchase: Number(item.price),
          currency_at_purchase: 'AUD'
        }))

        console.log('Order items to insert:', JSON.stringify(orderItems, null, 2))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Order items creation error:', itemsError)
          throw itemsError
        }

        console.log('Order items created successfully')

        // Update each product to mark as sold
        console.log('Updating product stock status...')
        for (const item of orderItems) {
          console.log(`Marking product ${item.product_id} as sold`)

          // Update stock fields and set is_active to false
          const { error: productError } = await supabase
            .from('products')
            .update({
              stock: 0,  // Set stock to 0
              is_active: false  // Mark as inactive/sold
            })
            .eq('id', item.product_id)

          if (productError) {
            console.error(`Error updating product ${item.product_id}:`, productError)
            console.error('Product update error details:', JSON.stringify(productError, null, 2))
            // Don't throw error here - we want to continue with other products
          } else {
            console.log(`Product ${item.product_id} marked as sold successfully`)
          }
        }

        console.log('Product stock updates completed')

        // Send order confirmation email
        console.log('Sending order confirmation email...')
        try {
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
            body: { orderId: order.id }
          })

          if (emailError) {
            console.error('Failed to send order confirmation email:', emailError)
          } else {
            console.log('Order confirmation email sent successfully:', emailResult)
          }
        } catch (emailError) {
          console.error('Error sending order confirmation email:', emailError)
          // Don't throw error - we don't want email failure to break the order process
        }

        // Mark reservations as completed and release them
        const { error: reservationError } = await supabase
          .from('cart_reservations')
          .update({ is_expired: true })
          .eq('session_id', sessionId)

        if (reservationError) {
          console.error('Error updating reservations:', reservationError)
        }

        console.log('Updated reservations for session:', sessionId)
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