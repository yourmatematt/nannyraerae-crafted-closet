import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getCurrentSessionId } from '@/lib/session';
import { getSessionReservations, cleanupExpiredReservations } from '@/lib/reservations';
import { useCart } from '@/contexts/CartContext';

/**
 * Hook to manage reservation timers and automatic cleanup
 * Runs every second to check for expired reservations
 */
export function useReservationTimer() {
  const { sessionId, removeFromCart } = useCart();

  const checkExpiredReservations = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Get current session reservations
      const reservations = await getSessionReservations(sessionId);
      const now = new Date();

      // Check for reservations expiring soon (within 2 minutes)
      const expiringSoon = reservations.filter(reservation => {
        const utcTimeString = reservation.expires_at.endsWith('Z') ? reservation.expires_at : reservation.expires_at + 'Z';
        const expiresAt = new Date(utcTimeString);
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        return timeUntilExpiry > 0 && timeUntilExpiry <= 2 * 60 * 1000; // 2 minutes
      });

      // Show warning for items expiring soon
      expiringSoon.forEach(reservation => {
        const utcTimeString = reservation.expires_at.endsWith('Z') ? reservation.expires_at : reservation.expires_at + 'Z';
        const expiresAt = new Date(utcTimeString);
        const minutesLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (60 * 1000));

        toast.warning(`Your cart reservation expires in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}!`, {
          id: `expiring-${reservation.product_id}`,
          duration: 10000,
          action: {
            label: 'Checkout Now',
            onClick: () => window.location.href = '/cart'
          }
        });
      });

      // Run cleanup to remove expired reservations
      await cleanupExpiredReservations();

      // Check if any items in our local cart have expired
      const currentCart = JSON.parse(localStorage.getItem('nannyraerae-cart') || '[]');

      console.log('🔍 useReservationTimer - checking localStorage cart:', {
        cartItems: currentCart.length,
        sessionId,
        currentTime: now.toISOString()
      });

      const expiredItems = currentCart.filter((item: any) => {
        if (item.reservedUntil && item.sessionId === sessionId) {
          const utcTimeString = item.reservedUntil.endsWith('Z') ? item.reservedUntil : item.reservedUntil + 'Z';
          const reservedUntilDate = new Date(utcTimeString);
          const isExpired = reservedUntilDate <= now;
          console.log(`Checking ${item.name}:`, {
            reservedUntil: item.reservedUntil,
            currentTime: now.toISOString(),
            isExpired,
            timeDiff: reservedUntilDate.getTime() - now.getTime()
          });
          return isExpired;
        }
        return false;
      });

      console.log('💀 useReservationTimer found expired items:', expiredItems.length);

      // Remove expired items from cart
      expiredItems.forEach((item: any) => {
        console.log('🚨 useReservationTimer removing:', item.name);
        removeFromCart(item.id);
        toast.error(`${item.name} was removed from your cart (reservation expired)`, {
          duration: 5000
        });
      });

    } catch (error) {
      console.error('Error checking expired reservations:', error);
    }
  }, [sessionId, removeFromCart]);

  // Set up timer to check every second
  useEffect(() => {
    if (!sessionId) return;

    // DISABLED: Immediate check that was causing instant cart clearing
    // checkExpiredReservations();

    // Set up interval to check every 30 seconds (less aggressive)
    const interval = setInterval(() => {
      console.log('🔄 useReservationTimer - periodic check');
      checkExpiredReservations();
    }, 30000); // 30 seconds instead of 1 second

    return () => {
      clearInterval(interval);
    };
  }, [sessionId, checkExpiredReservations]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Run a final cleanup when component unmounts
      if (sessionId) {
        cleanupExpiredReservations();
      }
    };
  }, [sessionId]);
}

/**
 * Hook to get time remaining for cart items
 */
export function useCartItemTimeRemaining() {
  const { items } = useCart();

  const getTimeRemaining = useCallback((item: any) => {
    if (!item.reservedUntil) return null;

    const now = new Date();
    const utcTimeString = item.reservedUntil.endsWith('Z') ? item.reservedUntil : item.reservedUntil + 'Z';
    const expiresAt = new Date(utcTimeString);
    const timeRemaining = expiresAt.getTime() - now.getTime();

    if (timeRemaining <= 0) return null;

    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

    return { minutes, seconds, totalSeconds: Math.floor(timeRemaining / 1000) };
  }, []);

  return { getTimeRemaining };
}