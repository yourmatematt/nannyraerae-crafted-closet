/**
 * Session management utility for cart reservations
 */

const SESSION_STORAGE_KEY = 'cart_session_id';

/**
 * Generates a unique session ID using crypto.randomUUID()
 * Stores it in sessionStorage and returns existing session ID if already present
 */
export function getOrCreateSessionId(): string {
  // Check if session ID already exists in sessionStorage
  const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  // Generate new session ID using crypto.randomUUID()
  let sessionId: string;

  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    sessionId = crypto.randomUUID();
  } else {
    // Fallback for environments where crypto.randomUUID is not available
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Store in sessionStorage
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}

/**
 * Get the current session ID without creating a new one
 */
export function getCurrentSessionId(): string | null {
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
}

/**
 * Clear the current session ID
 */
export function clearSessionId(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Check if we have an active session
 */
export function hasActiveSession(): boolean {
  return sessionStorage.getItem(SESSION_STORAGE_KEY) !== null;
}