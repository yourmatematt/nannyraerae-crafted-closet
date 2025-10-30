import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { releaseReservation, getSessionReservations } from '@/lib/reservations';
import { Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TimeRemaining {
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function ReservationTimerBanner() {
  const { items, removeFromCart, sessionId } = useCart();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isValidatingReservations, setIsValidatingReservations] = useState(false);
  const itemsRef = useRef(items);

  // Update ref when items change
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Calculate the earliest expiry time from all cart items
  const calculateTimeRemaining = (): TimeRemaining | null => {
    if (!items.length) return null;

    const now = new Date();
    let earliestExpiry: Date | null = null;

    console.log('🕐 Timer Debug - Starting calculation');
    console.log('Current time:', now.toISOString());
    console.log('Cart items:', items.length);

    // Find the earliest expiry time from all cart items
    items.forEach((item, index) => {
      if (item.reservedUntil) {
        // Force UTC parsing by adding 'Z' if not present
        const utcTimeString = item.reservedUntil.endsWith('Z') ? item.reservedUntil : item.reservedUntil + 'Z';
        const itemExpiry = new Date(utcTimeString);

        console.log(`Item ${index + 1}:`, {
          name: item.name,
          originalReservedUntil: item.reservedUntil,
          utcTimeString,
          parsedExpiry: itemExpiry.toISOString(),
          isValid: !isNaN(itemExpiry.getTime())
        });

        if (!earliestExpiry || itemExpiry < earliestExpiry) {
          earliestExpiry = itemExpiry;
        }
      } else {
        console.log(`Item ${index + 1}: NO reservedUntil`, item.name);
      }
    });

    if (!earliestExpiry) {
      console.log('❌ No earliest expiry found');
      return null;
    }

    console.log('Earliest expiry:', earliestExpiry.toISOString());

    const timeDiff = earliestExpiry.getTime() - now.getTime();
    console.log('Time difference (ms):', timeDiff);

    if (timeDiff <= 0) {
      console.log('❌ Time already expired - Details:', {
        earliestExpiry: earliestExpiry.toISOString(),
        now: now.toISOString(),
        timeDiff,
        timeDiffMinutes: Math.floor(timeDiff / (1000 * 60)),
        isImmediateExpiration: Math.abs(timeDiff) < 5000 // Less than 5 seconds difference
      });

      // If the expiration is immediate (within 5 seconds), it might be a timing/timezone issue
      if (Math.abs(timeDiff) < 5000) {
        console.log('⚠️ Immediate expiration detected - might be timing issue, returning 1 second remaining');
        return { minutes: 0, seconds: 1, totalSeconds: 1 };
      }

      return null;
    }

    const totalSeconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    console.log('✅ Time remaining:', { minutes, seconds, totalSeconds });

    return { minutes, seconds, totalSeconds };
  };

  // Validate reservations against Supabase to ensure persistence
  const validateReservations = useCallback(async () => {
    if (!sessionId || isValidatingReservations) return;

    setIsValidatingReservations(true);
    try {
      // Get current reservations from Supabase
      const activeReservations = await getSessionReservations(sessionId);
      const reservationMap = new Map(
        activeReservations.map(res => [res.product_id.toString(), res])
      );

      // Check if any cart items have invalid reservations
      console.log('🔍 Validating reservations:', activeReservations.length, 'found in database');

      const currentItems = itemsRef.current;
      const invalidItems = currentItems.filter(item => {
        const reservation = reservationMap.get(item.productId);
        if (!reservation) {
          console.log(`❌ No reservation found for product ${item.productId} (${item.name})`);
          // If no reservation found, this indicates the database sync is still happening
          // Don't remove the item immediately - let the periodic validation handle it
          return false; // Don't remove items without reservations immediately
        }

        const now = new Date();
        // Force UTC parsing by adding 'Z' if not present for database time
        const dbUtcTimeString = reservation.expires_at.endsWith('Z') ? reservation.expires_at : reservation.expires_at + 'Z';
        const expiresAt = new Date(dbUtcTimeString);
        const isExpired = expiresAt <= now;

        console.log(`Validating ${item.name}:`, {
          productId: item.productId,
          originalDbExpiry: reservation.expires_at,
          dbUtcTimeString,
          parsedExpiry: expiresAt.toISOString(),
          currentTime: now.toISOString(),
          isExpired,
          timeDiff: expiresAt.getTime() - now.getTime()
        });

        return isExpired; // Only remove if truly expired
      });

      // Only remove items if they are actually invalid
      if (invalidItems.length > 0) {
        console.log('🚨 Found invalid items to remove:', invalidItems.map(item => ({
          name: item.name,
          productId: item.productId,
          reservedUntil: item.reservedUntil
        })));

        // Remove invalid items
        for (const item of invalidItems) {
          console.log(`Removing invalid item: ${item.name}`);
          await releaseReservation(sessionId, item.productId);
          removeFromCart(item.id);
        }

        toast.error('Some items were removed from your cart due to expired reservations.', {
          duration: 5000,
          action: {
            label: 'Shop Again',
            onClick: () => navigate('/collection')
          }
        });
      } else {
        console.log('✅ All cart items have valid reservations');
      }
    } catch (error) {
      console.error('Error validating reservations:', error);
    } finally {
      setIsValidatingReservations(false);
    }
  }, [sessionId, removeFromCart, navigate, isValidatingReservations]); // Removed 'items' to prevent recreating on cart changes

  // Handle expired items
  const handleExpiredItems = async () => {
    if (!sessionId) return;

    const now = new Date();
    console.log('💀 Expiration check - Current time:', now.toISOString());

    const expiredItems = items.filter(item => {
      if (item.reservedUntil) {
        // Force UTC parsing by adding 'Z' if not present
        const utcTimeString = item.reservedUntil.endsWith('Z') ? item.reservedUntil : item.reservedUntil + 'Z';
        const itemExpiry = new Date(utcTimeString);
        const isExpired = itemExpiry <= now;
        console.log(`Checking ${item.name}:`, {
          originalReservedUntil: item.reservedUntil,
          utcTimeString,
          parsedExpiry: itemExpiry.toISOString(),
          currentTime: now.toISOString(),
          isExpired,
          timeDiff: itemExpiry.getTime() - now.getTime()
        });
        return isExpired;
      }
      return false;
    });

    console.log('Expired items found:', expiredItems.length);

    if (expiredItems.length > 0) {
      console.log('🚨 Removing expired items:', expiredItems.map(item => item.name));

      // Remove expired items from cart and release reservations
      for (const item of expiredItems) {
        await releaseReservation(sessionId, item.productId);
        removeFromCart(item.id);
      }

      // Show notification
      toast.error('Your reservation expired. Items have been removed from cart.', {
        duration: 6000,
        action: {
          label: 'Shop Again',
          onClick: () => navigate('/collection')
        }
      });

      // Hide banner
      setIsVisible(false);
    }
  };

  // DISABLED: Aggressive validation on cart changes that was removing items prematurely
  // useEffect(() => {
  //   if (sessionId && items.length > 0) {
  //     // Add a small delay to allow database operations to complete
  //     const timer = setTimeout(() => {
  //       console.log('⏳ Starting delayed validation after cart change');
  //       validateReservations();
  //     }, 1000); // 1 second delay

  //     return () => clearTimeout(timer);
  //   }
  // }, [sessionId, validateReservations]);

  // Update timer every second
  useEffect(() => {
    console.log('⏰ Timer effect triggered - items count:', items.length);

    const updateTimer = () => {
      console.log('🔄 UpdateTimer called, calculating remaining time...');
      const remaining = calculateTimeRemaining();
      console.log('🔄 Calculated remaining:', remaining);
      setTimeRemaining(remaining);

      // Show/hide banner based on cart items
      setIsVisible(items.length > 0 && remaining !== null);

      // Handle expired items - but NOT on the first calculation to avoid immediate removal
      if (remaining === null && items.length > 0) {
        console.log('⚠️ Timer shows expired, but checking if this is immediate...');
        console.log('⚠️ Current items:', items.map(item => ({
          name: item.name,
          reservedUntil: item.reservedUntil
        })));

        // Add a delay to prevent immediate removal due to timing/parsing issues
        setTimeout(() => {
          const recheckRemaining = calculateTimeRemaining();
          console.log('🔄 Recheck after 1s:', recheckRemaining);

          if (recheckRemaining === null && items.length > 0) {
            console.log('⚠️ Still expired after recheck, triggering expiration handling');
            handleExpiredItems();
          } else {
            console.log('✅ Expiration was a timing issue, items are actually valid');
          }
        }, 1000);
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [items, sessionId, removeFromCart, navigate]);

  // Periodic validation every 60 seconds to ensure sync with Supabase
  // Only depends on sessionId to avoid restarting timer on cart changes
  useEffect(() => {
    if (!sessionId) return;

    const validationInterval = setInterval(() => {
      if (items.length > 0) {
        console.log('🔄 Periodic validation (60s interval)');
        validateReservations();
      }
    }, 60000); // Validate every 60 seconds (less aggressive)

    return () => clearInterval(validationInterval);
  }, [sessionId, validateReservations]); // Removed items.length dependency

  // Don't render if not visible or no time remaining
  if (!isVisible || !timeRemaining) {
    return null;
  }

  // Determine background color based on time remaining
  const getBackgroundColor = (totalSeconds: number): string => {
    if (totalSeconds > 5 * 60) {
      // > 5 minutes: Green
      return 'bg-[#769B7C]';
    } else if (totalSeconds > 2 * 60) {
      // 2-5 minutes: Yellow/Amber
      return 'bg-amber-500';
    } else {
      // < 2 minutes: Red
      return 'bg-red-500';
    }
  };

  // Format time display
  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const backgroundColorClass = getBackgroundColor(timeRemaining.totalSeconds);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] h-[88px] sm:h-[64px] ${backgroundColorClass} text-white shadow-none transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-3 gap-3 sm:gap-0 h-full">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-center sm:text-left">
                🕐 Your pieces are reserved for {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
              </span>
              <span className="hidden sm:inline text-white/90">
                | Complete checkout to secure them
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex sm:hidden items-center gap-2 text-sm text-white/90">
              <ShoppingBag className="w-4 h-4" />
              <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-white/90">
              <ShoppingBag className="w-4 h-4" />
              <span>{items.length} item{items.length !== 1 ? 's' : ''} in cart</span>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/cart')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-medium whitespace-nowrap"
            >
              Checkout Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationTimerBanner;