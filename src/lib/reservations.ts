import { supabase } from './supabase';

/**
 * Cart reservation system for managing product reservations
 * Prevents multiple users from adding the same item to cart simultaneously
 */

export interface CartReservation {
  id: string;
  session_id: string;
  product_id: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface ReservationResult {
  success: boolean;
  message: string;
  reservation?: CartReservation;
}

/**
 * Creates a reservation in the cart_reservations table with 15-minute expiry
 */
export async function createReservation(
  sessionId: string,
  productId: string
): Promise<ReservationResult> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    console.log('🔄 Creating reservation:', {
      productId,
      sessionId,
      currentTime: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      expiresAtMs: expiresAt.getTime()
    });

    // First, check if there's already an active reservation for this product
    const { data: existingReservations, error: checkError } = await supabase
      .from('cart_reservations')
      .select('*')
      .eq('product_id', productId)
      .eq('is_expired', false)
      .gt('expires_at', now.toISOString());

    if (checkError) {
      console.error('Error checking existing reservations:', checkError);
      return { success: false, message: 'Failed to check existing reservations' };
    }

    // If there's an existing reservation by a different session, deny the request
    if (existingReservations && existingReservations.length > 0) {
      const existingReservation = existingReservations[0];
      if (existingReservation.session_id !== sessionId) {
        return {
          success: false,
          message: 'This item is currently reserved by another customer'
        };
      }
      // If it's the same session, return the existing reservation
      return {
        success: true,
        message: 'Item already reserved by your session',
        reservation: existingReservation
      };
    }

    // Create new reservation
    const { data, error } = await supabase
      .from('cart_reservations')
      .insert({
        session_id: sessionId,
        product_id: productId,
        expires_at: expiresAt.toISOString(),
        is_expired: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      return { success: false, message: 'Failed to create reservation' };
    }

    // Update product reservation fields
    const updateResult = await updateProductReservation(productId, sessionId, expiresAt);
    if (!updateResult.success) {
      // If product update fails, clean up the reservation
      await releaseReservation(sessionId, productId);
      return updateResult;
    }

    return {
      success: true,
      message: 'Item reserved successfully',
      reservation: data as CartReservation
    };

  } catch (error) {
    console.error('Error in createReservation:', error);
    return { success: false, message: 'Unexpected error creating reservation' };
  }
}

/**
 * Checks if a reservation is still valid for a given session
 */
export async function checkReservation(sessionId: string): Promise<{
  hasActiveReservations: boolean;
  reservations: CartReservation[];
}> {
  try {
    const now = new Date();

    const { data: reservations, error } = await supabase
      .from('cart_reservations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_expired', false)
      .gt('expires_at', now.toISOString());

    if (error) {
      console.error('Error checking reservations:', error);
      return { hasActiveReservations: false, reservations: [] };
    }

    return {
      hasActiveReservations: reservations && reservations.length > 0,
      reservations: reservations as CartReservation[] || []
    };

  } catch (error) {
    console.error('Error in checkReservation:', error);
    return { hasActiveReservations: false, reservations: [] };
  }
}

/**
 * Marks a reservation as expired and clears product reservation fields
 */
export async function releaseReservation(
  sessionId: string,
  productId: string
): Promise<ReservationResult> {
  try {
    // Mark reservation as expired
    const { error: reservationError } = await supabase
      .from('cart_reservations')
      .update({ is_expired: true })
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .eq('is_expired', false);

    if (reservationError) {
      console.error('Error releasing reservation:', reservationError);
    }

    // Clear product reservation fields
    const { error: productError } = await supabase
      .from('products')
      .update({
        reserved_until: null,
        reserved_by_session: null
      })
      .eq('id', productId)
      .eq('reserved_by_session', sessionId);

    if (productError) {
      console.error('Error clearing product reservation:', productError);
      return { success: false, message: 'Failed to clear product reservation' };
    }

    return { success: true, message: 'Reservation released successfully' };

  } catch (error) {
    console.error('Error in releaseReservation:', error);
    return { success: false, message: 'Unexpected error releasing reservation' };
  }
}

/**
 * Updates the products table with reservation information
 */
export async function updateProductReservation(
  productId: string,
  sessionId: string,
  expiresAt: Date
): Promise<ReservationResult> {
  try {
    // First check if product is already reserved by another session
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('reserved_until, reserved_by_session')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('Error fetching product:', fetchError);
      return { success: false, message: 'Failed to fetch product information' };
    }

    // If product is reserved by another session and reservation is still valid
    if (product?.reserved_by_session &&
        product.reserved_by_session !== sessionId &&
        product.reserved_until &&
        new Date(product.reserved_until) > new Date()) {
      return {
        success: false,
        message: 'Product is currently reserved by another customer'
      };
    }

    // Update product reservation
    const { error: updateError } = await supabase
      .from('products')
      .update({
        reserved_until: expiresAt.toISOString(),
        reserved_by_session: sessionId
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product reservation:', updateError);
      return { success: false, message: 'Failed to update product reservation' };
    }

    return { success: true, message: 'Product reservation updated successfully' };

  } catch (error) {
    console.error('Error in updateProductReservation:', error);
    return { success: false, message: 'Unexpected error updating product reservation' };
  }
}

/**
 * Cleans up expired reservations for all sessions
 * This should be called periodically to maintain data consistency
 */
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const now = new Date();

    // Mark expired reservations
    const { error: reservationError } = await supabase
      .from('cart_reservations')
      .update({ is_expired: true })
      .eq('is_expired', false)
      .lt('expires_at', now.toISOString());

    if (reservationError) {
      console.error('Error marking expired reservations:', reservationError);
    }

    // Clear expired product reservations
    const { error: productError } = await supabase
      .from('products')
      .update({
        reserved_until: null,
        reserved_by_session: null
      })
      .not('reserved_until', 'is', null)
      .lt('reserved_until', now.toISOString());

    if (productError) {
      console.error('Error clearing expired product reservations:', productError);
    }

  } catch (error) {
    console.error('Error in cleanupExpiredReservations:', error);
  }
}

/**
 * Gets all active reservations for a specific session
 */
export async function getSessionReservations(sessionId: string): Promise<CartReservation[]> {
  try {
    const now = new Date();

    const { data: reservations, error } = await supabase
      .from('cart_reservations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_expired', false)
      .gt('expires_at', now.toISOString());

    if (error) {
      console.error('Error fetching session reservations:', error);
      return [];
    }

    return reservations as CartReservation[] || [];

  } catch (error) {
    console.error('Error in getSessionReservations:', error);
    return [];
  }
}