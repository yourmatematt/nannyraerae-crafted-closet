// @deno-types="npm:@types/stripe@latest"
import Stripe from 'npm:stripe@latest'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // LOG EVERYTHING
      console.log('Full session object:', JSON.stringify(session, null, 2))
      console.log('Shipping details:', session.shipping_details)
      console.log('Shipping:', session.shipping)
      console.log('Customer details:', session.customer_details)

      console.log('Processing checkout session:', session.id)

      // Get line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

      // Calculate totals with shipping
      const total = session.amount_total! / 100
      const shipping = 12.00  // Flat-rate shipping
      const subtotal = total - shipping

      // Create or get customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          email: session.customer_details?.email!,
          first_name: session.customer_details?.name?.split(' ')[0],
          last_name: session.customer_details?.name?.split(' ').slice(1).join(' '),
          phone: session.customer_details?.phone,
        }, { onConflict: 'email' })
        .select()
        .single()

      if (customerError) {
        console.error('Customer creation error:', customerError)
      }

      // Get shipping address from collected_information or fallback to customer_details
      const shippingAddress = session.collected_information?.shipping_details?.address || session.customer_details?.address

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer?.id,
          customer_email: session.customer_details?.email!,
          customer_first_name: session.customer_details?.name?.split(' ')[0] || '',
          customer_last_name: session.customer_details?.name?.split(' ').slice(1).join(' ') || '',
          customer_phone: session.customer_details?.phone || '',
          shipping_address_line1: shippingAddress?.line1,
          shipping_address_line2: shippingAddress?.line2,
          shipping_city: shippingAddress?.city,
          shipping_state: shippingAddress?.state,
          shipping_postcode: shippingAddress?.postal_code,
          shipping_country: shippingAddress?.country || 'AU',
          status: 'paid',
          subtotal,
          shipping_cost: 12.00,
          gst: 0.00,
          total,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_checkout_session_id: session.id,
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        throw orderError
      }

      console.log('Order created:', order.id)

      // Create order items (skip the shipping line item)
      const orderItems = lineItems.data
        .filter(item => !item.description?.includes('Standard Shipping'))
        .map(item => ({
          order_id: order.id,
          product_name: item.description!,
          product_price: item.price!.unit_amount! / 100,
          quantity: item.quantity!,
        }))

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Order items error:', itemsError)
        }
      }

      console.log('Order completed successfully')

      // Send email notifications
      try {
        // Customer confirmation email
        const customerEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': Deno.env.get('BREVO_API_KEY')!,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'By Nanny Rae Rae', email: 'orders@bynannyraerae.com.au' },
            to: [{ email: order.customer_email, name: order.customer_first_name }],
            subject: `Order Confirmation #${order.id.slice(0, 8)}`,
            htmlContent: `
              <h2>Thank you for your order!</h2>
              <p>Hi ${order.customer_first_name},</p>
              <p>Your order has been received and Rae will start crafting with love.</p>

              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${order.id.slice(0, 8)}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)} AUD</p>

              <h3>Shipping To</h3>
              <p>
                ${order.shipping_address_line1}<br>
                ${order.shipping_address_line2 ? order.shipping_address_line2 + '<br>' : ''}
                ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postcode}<br>
                ${order.shipping_country}
              </p>

              <p>You'll receive another email when your order ships.</p>
              <p>Thank you for supporting handmade!<br>Rae</p>
            `
          })
        })

        if (!customerEmailResponse.ok) {
          console.error('Failed to send customer email:', await customerEmailResponse.text())
        }

        // Admin notification email
        const orderItemsHtml = orderItems.map(item =>
          `<p>${item.product_name} x${item.quantity} - ${item.product_price.toFixed(2)}</p>`
        ).join('')

        const adminEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': Deno.env.get('BREVO_API_KEY')!,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'Store Orders', email: 'orders@bynannyraerae.com.au' },
            to: [{ email: Deno.env.get('ADMIN_EMAIL')! }],
            subject: `New Order #${order.id.slice(0, 8)} - ${order.total.toFixed(2)}`,
            htmlContent: `
              <h2>New Order Received!</h2>

              <h3>Customer</h3>
              <p>
                <strong>Name:</strong> ${order.customer_first_name} ${order.customer_last_name || ''}<br>
                <strong>Email:</strong> ${order.customer_email}<br>
                <strong>Phone:</strong> ${order.customer_phone || 'Not provided'}
              </p>

              <h3>Shipping Address</h3>
              <p>
                ${order.shipping_address_line1}<br>
                ${order.shipping_address_line2 ? order.shipping_address_line2 + '<br>' : ''}
                ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postcode}<br>
                ${order.shipping_country}
              </p>

              <h3>Items Ordered</h3>
              ${orderItemsHtml}

              <h3>Order Total</h3>
              <p>
                Subtotal: ${order.subtotal.toFixed(2)}<br>
                Shipping: ${order.shipping_cost.toFixed(2)}<br>
                <strong>Total: ${order.total.toFixed(2)} AUD</strong>
              </p>
            `
          })
        })

        if (!adminEmailResponse.ok) {
          console.error('Failed to send admin email:', await adminEmailResponse.text())
        } else {
          console.log('Emails sent successfully')
        }

      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't throw - continue with webhook success
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})