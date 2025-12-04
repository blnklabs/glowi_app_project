/**
 * Despia Native SDK Utilities
 * 
 * Provides environment detection, platform identification, and native feature
 * helpers for apps running in the Despia native runtime.
 * 
 * When running in Despia, the user agent includes "despia" along with platform
 * identifiers like "iphone", "ipad", or "android".
 */

import despia from 'despia-native';

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if running in the Despia native runtime
 */
export const isDespia = () => {
  return navigator.userAgent.toLowerCase().includes('despia');
};

/**
 * Check if running in Despia on iOS (iPhone or iPad)
 */
export const isDespiaIOS = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('despia') && (ua.includes('iphone') || ua.includes('ipad'));
};

/**
 * Check if running in Despia on Android
 */
export const isDespiaAndroid = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('despia') && ua.includes('android');
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
// Haptic Feedback
// ============================================================================

/**
 * Trigger light haptic feedback (subtle, for UI interactions)
 * Only executes when running in Despia native runtime
 */
export const lightHaptic = () => {
  if (isDespia()) {
    despia('lighthaptic://');
  }
};

/**
 * Trigger heavy haptic feedback (strong, for emphasis)
 * Only executes when running in Despia native runtime
 */
export const heavyHaptic = () => {
  if (isDespia()) {
    despia('heavyhaptic://');
  }
};

/**
 * Trigger success haptic feedback (for completed actions)
 * Only executes when running in Despia native runtime
 */
export const successHaptic = () => {
  if (isDespia()) {
    despia('successhaptic://');
  }
};

/**
 * Trigger warning haptic feedback (for cautionary alerts)
 * Only executes when running in Despia native runtime
 */
export const warningHaptic = () => {
  if (isDespia()) {
    despia('warninghaptic://');
  }
};

/**
 * Trigger error haptic feedback (for failed operations)
 * Only executes when running in Despia native runtime
 */
export const errorHaptic = () => {
  if (isDespia()) {
    despia('errorhaptic://');
  }
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
};

// ============================================================================
// Export the raw despia function for advanced usage
// ============================================================================

export { despia };

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
  // Raw SDK
  despia,
};

