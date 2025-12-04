/**
 * Despia Native SDK Utilities (Fail-Safe)
 * 
 * Provides environment detection, platform identification, and native feature
 * helpers for apps running in the Despia native runtime.
 * 
 * All operations are wrapped in try-catch to ensure the app renders
 * even if the Despia SDK fails to load or execute.
 */

// ============================================================================
// Lazy SDK Loading
// ============================================================================

let despiaSDK = null;
let sdkLoadAttempted = false;

/**
 * Lazily load the despia SDK on first use
 */
const getDespia = async () => {
  if (sdkLoadAttempted) return despiaSDK;
  sdkLoadAttempted = true;
  
  try {
    const module = await import('despia-native');
    despiaSDK = module.default || module;
  } catch (e) {
    console.warn('[Despia] SDK import failed:', e.message);
    despiaSDK = null;
  }
  
  return despiaSDK;
};

// Pre-load SDK in background (non-blocking)
if (typeof window !== 'undefined') {
  getDespia().catch(() => {});
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if running in the Despia native runtime
 */
export const isDespia = () => {
  try {
    if (typeof navigator === 'undefined') return false;
    return navigator.userAgent.toLowerCase().includes('despia');
  } catch (e) {
    return false;
  }
};

/**
 * Check if running in Despia on iOS (iPhone or iPad)
 */
export const isDespiaIOS = () => {
  try {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('despia') && (ua.includes('iphone') || ua.includes('ipad'));
  } catch (e) {
    return false;
  }
};

/**
 * Check if running in Despia on Android
 */
export const isDespiaAndroid = () => {
  try {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('despia') && ua.includes('android');
  } catch (e) {
    return false;
  }
};

/**
 * Get the current platform context
 * @returns {'ios' | 'android' | 'web'} The detected platform
 */
export const getPlatform = () => {
  if (isDespiaIOS()) return 'ios';
  if (isDespiaAndroid()) return 'android';
  return 'web';
};

// ============================================================================
// Safe Despia Command Execution
// ============================================================================

/**
 * Safely execute a despia command
 * @param {string} command - The despia command URL
 */
const safeDespia = (command) => {
  try {
    if (!isDespia()) return;
    
    // Use cached SDK if available
    if (despiaSDK && typeof despiaSDK === 'function') {
      despiaSDK(command);
      return;
    }
    
    // Otherwise load and execute
    getDespia().then(sdk => {
      if (sdk && typeof sdk === 'function') {
        sdk(command);
      }
    }).catch(() => {});
  } catch (e) {
    console.warn('[Despia] Command failed:', command, e.message);
  }
};

// ============================================================================
// Haptic Feedback
// ============================================================================

/**
 * Trigger light haptic feedback (subtle, for UI interactions)
 * Only executes when running in Despia native runtime
 */
export const lightHaptic = () => {
  safeDespia('lighthaptic://');
};

/**
 * Trigger heavy haptic feedback (strong, for emphasis)
 * Only executes when running in Despia native runtime
 */
export const heavyHaptic = () => {
  safeDespia('heavyhaptic://');
};

/**
 * Trigger success haptic feedback (for completed actions)
 * Only executes when running in Despia native runtime
 */
export const successHaptic = () => {
  safeDespia('successhaptic://');
};

/**
 * Trigger warning haptic feedback (for cautionary alerts)
 * Only executes when running in Despia native runtime
 */
export const warningHaptic = () => {
  safeDespia('warninghaptic://');
};

/**
 * Trigger error haptic feedback (for failed operations)
 * Only executes when running in Despia native runtime
 */
export const errorHaptic = () => {
  safeDespia('errorhaptic://');
};

// ============================================================================
// Safe Area Support
// ============================================================================

/**
 * Initialize safe area CSS variables with fallbacks
 * 
 * When running in Despia, the native runtime automatically injects
 * --safe-area-top and --safe-area-bottom CSS variables.
 * 
 * For web fallback, this sets sensible defaults using env() with fallbacks.
 */
export const initSafeAreas = () => {
  try {
    if (typeof document === 'undefined') return;
    
    // Only set fallbacks when NOT in Despia (Despia injects its own)
    if (!isDespia()) {
      document.documentElement.style.setProperty(
        '--safe-area-top',
        'env(safe-area-inset-top, 0px)'
      );
      document.documentElement.style.setProperty(
        '--safe-area-bottom',
        'env(safe-area-inset-bottom, 0px)'
      );
    }
  } catch (e) {
    console.warn('[Despia] initSafeAreas failed:', e.message);
  }
};

// ============================================================================
// Export the raw despia function for advanced usage
// ============================================================================

export const despia = safeDespia;

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Register a callback for native back navigation events.
 * Despia's native swipe-back gesture may trigger popstate or a custom event.
 * This function sets up listeners for both possibilities.
 * 
 * @param {Function} callback - Function to call when back gesture is detected
 * @returns {Function} Cleanup function to remove listeners
 */
export const onNativeBackGesture = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  // Listen for popstate events (triggered by history.back())
  const handlePopState = (event) => {
    // Only handle if in Despia environment
    if (isDespia()) {
      callback(event);
    }
  };
  
  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

// Default export with all utilities
export default {
  // Environment
  isDespia,
  isDespiaIOS,
  isDespiaAndroid,
  getPlatform,
  // Haptics
  lightHaptic,
  heavyHaptic,
  successHaptic,
  warningHaptic,
  errorHaptic,
  // Safe Areas
  initSafeAreas,
  // Navigation
  onNativeBackGesture,
  // Raw SDK
  despia: safeDespia,
};
