import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

    console.log('🔧 Test Function - Environment Check:')
    console.log('🔧 STRIPE_SECRET_KEY present:', !!stripeSecretKey)
    console.log('🔧 STRIPE_SECRET_KEY prefix:', stripeSecretKey ? stripeSecretKey.substring(0, 20) + '...' : 'undefined')

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({
          error: 'STRIPE_SECRET_KEY not found',
          env_vars: Object.keys(Deno.env.toObject()).filter(key => key.includes('STRIPE'))
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Test creating a minimal payment intent
    const testPaymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 AUD
      currency: 'aud',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        stripe_key_prefix: stripeSecretKey.substring(0, 20) + '...',
        test_payment_intent_id: testPaymentIntent.id,
        message: 'Stripe connection working!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Test function error:', error)

    return new Response(
      JSON.stringify({
        error: 'Test failed',
        message: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})