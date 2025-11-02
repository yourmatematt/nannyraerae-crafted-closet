import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔧 Simple Test Webhook Called:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(req.headers.entries())
  })

  if (req.method === 'OPTIONS') {
    console.log('📝 Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log('❌ Wrong method:', req.method)
    return new Response('Method not allowed', {
      status: 405,
      headers: {
        ...corsHeaders,
        'Allow': 'POST, OPTIONS'
      }
    })
  }

  try {
    const body = await req.text()
    console.log('📦 Request body:', body.substring(0, 500) + '...')

    const response = {
      success: true,
      message: 'Test webhook is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      bodyLength: body.length
    }

    console.log('✅ Sending success response:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})