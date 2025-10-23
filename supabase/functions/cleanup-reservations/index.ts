import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupStats {
  expiredReservations: number;
  updatedProducts: number;
  errors: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting reservation cleanup process...')
    const startTime = new Date()

    const cleanupStats: CleanupStats = {
      expiredReservations: 0,
      updatedProducts: 0,
      errors: []
    }

    // 1. Find all expired reservations that are still active
    const { data: expiredReservations, error: findError } = await supabase
      .from('cart_reservations')
      .select('*')
      .lt('expires_at', new Date().toISOString())
      .eq('is_expired', false)

    if (findError) {
      throw new Error(`Failed to find expired reservations: ${findError.message}`)
    }

    console.log(`Found ${expiredReservations?.length || 0} expired reservations`)

    if (!expiredReservations || expiredReservations.length === 0) {
      console.log('No expired reservations found - cleanup complete')
      return new Response(JSON.stringify({
        success: true,
        message: 'No expired reservations found',
        stats: cleanupStats,
        executionTime: `${Date.now() - startTime.getTime()}ms`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // 2. Update expired reservations status
    const reservationIds = expiredReservations.map(r => r.id)

    const { error: updateReservationsError } = await supabase
      .from('cart_reservations')
      .update({
        is_expired: true,
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .in('id', reservationIds)

    if (updateReservationsError) {
      cleanupStats.errors.push(`Failed to update reservations: ${updateReservationsError.message}`)
      console.error('Failed to update reservations:', updateReservationsError.message)
    } else {
      cleanupStats.expiredReservations = expiredReservations.length
      console.log(`Marked ${expiredReservations.length} reservations as expired`)
    }

    // 3. Release product reservations
    for (const reservation of expiredReservations) {
      try {
        // Update product to remove reservation fields
        const { error: productError } = await supabase
          .from('products')
          .update({
            reserved_until: null,
            reserved_by_session: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', reservation.product_id)
          .eq('reserved_by_session', reservation.session_id) // Only update if still reserved by this session

        if (productError) {
          const errorMsg = `Failed to release product ${reservation.product_id}: ${productError.message}`
          cleanupStats.errors.push(errorMsg)
          console.error(errorMsg)
        } else {
          cleanupStats.updatedProducts++
          console.log(`Released reservation for product ${reservation.product_id}`)
        }
      } catch (error) {
        const errorMsg = `Error processing product ${reservation.product_id}: ${error.message}`
        cleanupStats.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    // 4. Log cleanup summary
    const executionTime = Date.now() - startTime.getTime()
    const summary = {
      timestamp: startTime.toISOString(),
      expiredReservations: cleanupStats.expiredReservations,
      updatedProducts: cleanupStats.updatedProducts,
      errors: cleanupStats.errors.length,
      executionTime: `${executionTime}ms`
    }

    console.log('Cleanup completed:', summary)

    // Return cleanup results
    return new Response(JSON.stringify({
      success: true,
      message: 'Reservation cleanup completed',
      stats: cleanupStats,
      summary,
      executionTime: `${executionTime}ms`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Cleanup function error:', error)

    return new Response(JSON.stringify({
      success: false,
      error: 'Cleanup function failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// For manual testing, you can also export the cleanup logic
export async function cleanupExpiredReservations() {
  const response = await fetch('/cleanup-reservations', { method: 'POST' })
  return response.json()
}