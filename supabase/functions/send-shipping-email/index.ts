import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, trackingNumber } = await req.json()

    if (!orderId || !trackingNumber) {
      throw new Error('Missing required parameters: orderId and trackingNumber')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Environment variables for Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    const brevoShippingTemplateId = Deno.env.get('BREVO_SHIPPING_TEMPLATE_ID')
    const brevoFromEmail = Deno.env.get('BREVO_FROM_EMAIL') || 'orders@bynannyraerae.com.au'
    const brevoFromName = Deno.env.get('BREVO_FROM_NAME') || 'Nanny Rae Rae'

    if (!brevoApiKey || !brevoShippingTemplateId) {
      throw new Error('Missing Brevo configuration: BREVO_API_KEY or BREVO_SHIPPING_TEMPLATE_ID')
    }

    console.log('Sending shipping email for order:', orderId)

    // Fetch order details
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !orderData) {
      throw new Error(`Failed to fetch order: ${orderError?.message}`)
    }

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsError) {
      console.warn('Failed to fetch order items:', itemsError.message)
    }

    // Prepare email data
    const orderShortId = orderId.slice(-8)
    const customerName = `${orderData.customer_first_name} ${orderData.customer_last_name}`.trim()

    const shippedDate = new Date().toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const products = (orderItems || []).map(item => ({
      name: item.product_name,
      image: item.product_image || '',
      quantity: item.quantity || 1,
      price: item.product_price
    }))

    const emailParams = {
      to: [{
        email: orderData.customer_email,
        name: customerName
      }],
      templateId: parseInt(brevoShippingTemplateId),
      params: {
        CUSTOMER_NAME: customerName,
        ORDER_ID: orderShortId,
        TRACKING_NUMBER: trackingNumber,
        SHIPPED_DATE: shippedDate,
        PRODUCTS: products,
        ADDRESS_LINE1: orderData.shipping_address_line1 || '',
        ADDRESS_LINE2: orderData.shipping_address_line2 || '',
        CITY: orderData.shipping_city || '',
        STATE: orderData.shipping_state || '',
        POSTCODE: orderData.shipping_postcode || '',
        COUNTRY: orderData.shipping_country || 'Australia',
        TOTAL: orderData.total || 0
      },
      sender: {
        email: brevoFromEmail,
        name: brevoFromName
      }
    }

    console.log('Sending email with params:', JSON.stringify(emailParams, null, 2))

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(emailParams)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Brevo API error:', response.status, errorText)
      throw new Error(`Failed to send email: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
        orderShortId,
        customerEmail: orderData.customer_email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Shipping email error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})