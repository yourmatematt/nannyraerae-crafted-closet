import { useReservationTimer } from '@/hooks/useReservationTimer';

/**
 * Component that handles reservation timing and cleanup
 * Should be placed high in the component tree to ensure it runs globally
 */
export function ReservationManager() {
  useReservationTimer();

  // This component doesn't render anything, it just runs the timer logic
  return null;
}