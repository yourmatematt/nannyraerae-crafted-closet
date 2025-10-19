import { supabase } from '../supabase/client'

export interface ReservationResult {
  success: boolean
  expiresAt?: Date
  error?: string
}

export const reserveProduct = async (productId: string, userId?: string, sessionId?: string): Promise<ReservationResult> => {
  try {
    const { data, error } = await supabase.rpc('reserve_product', {
      product_uuid: productId,
      user_uuid: userId,
      session_uuid: sessionId
    })

    if (error) {
      console.error('Reservation error:', error)
      return { success: false, error: error.message }
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Reservation failed' }
    }

    return {
      success: true,
      expiresAt: new Date(data.expires_at)
    }
  } catch (error) {
    console.error('Reservation error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

export const releaseReservation = async (productId: string): Promise<boolean> => {
  try {
    // Remove from cart
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('product_id', productId)

    if (cartError) {
      console.error('Error releasing cart reservation:', cartError)
      return false
    }

    // Update product reservation status
    const { error: productError } = await supabase
      .from('products')
      .update({
        is_reserved: false,
        reserved_until: null
      })
      .eq('id', productId)

    if (productError) {
      console.error('Error updating product reservation:', productError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error releasing reservation:', error)
    return false
  }
}

export const getTimeRemaining = (expiresAt: Date): number => {
  return Math.max(0, expiresAt.getTime() - Date.now())
}

export const formatTimeRemaining = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

export const isReservationExpired = (expiresAt: Date): boolean => {
  return Date.now() >= expiresAt.getTime()
}

export const cleanupExpiredReservations = async (): Promise<void> => {
  try {
    await supabase.rpc('release_expired_reservations')
  } catch (error) {
    console.error('Error cleaning up expired reservations:', error)
  }
}