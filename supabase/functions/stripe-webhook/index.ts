import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
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
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)

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
        session_id: sessionId,
        stripe_payment_intent_id: paymentIntent.id,
        customer_email: customerDetails.email,
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: customerDetails.phone,
        customer_name: customerDetails.name,
        shipping_address_line1: customerDetails.address?.line1,
        shipping_address_line2: customerDetails.address?.line2 || null,
        shipping_city: customerDetails.address?.city,
        shipping_state: customerDetails.address?.state,
        shipping_postcode: customerDetails.address?.postalCode,
        shipping_country: customerDetails.address?.country || 'Australia',
        subtotal: Number(orderSummary.subtotal || 0),
        tax_amount: 0,
        shipping_cost: Number(orderSummary.shipping || 0),
        total: Number(orderSummary.total || 0),
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

        // Create order items
        const orderItems = cartItems.map((item: any) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          product_price: Number(item.price),
          quantity: Number(item.quantity || 1),
          product_image: item.imageUrl
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Order items creation error:', itemsError)
          throw itemsError
        }

        console.log('Order items created successfully')

        // Update products to mark as sold
        for (const item of orderItems) {
          const { error: productError } = await supabase
            .from('products')
            .update({
              stock: 0,
              is_active: false
            })
            .eq('id', item.product_id)

          if (productError) {
            console.error(`Error updating product ${item.product_id}:`, productError)
          }
        }

        // Send order confirmation email
        try {
          await supabase.functions.invoke('send-order-confirmation', {
            body: { orderId: order.id }
          })
          console.log('Order confirmation email sent')
        } catch (emailError) {
          console.error('Error sending email:', emailError)
        }
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