import { useEffect } from 'react';
import Framework7 from 'framework7/lite-bundle';
import Framework7React, { App, View, f7ready, f7 } from 'framework7-react';
import routes from './routes.js';
import { ThemeProvider } from './context/ThemeContext';
import { isDespia, onNativeBackGesture } from './utils/despia.js';
import DebugOverlay from './components/DebugOverlay.jsx';

Framework7.use(Framework7React);

const f7params = {
  name: 'Starter App',
  theme: 'ios',
  routes: routes,
  view: {
    iosDynamicNavbar: true,
    animate: true,
    // Increase swipe-back detection area (default is 30px)
    // Helps with devices that have safe area insets
    iosSwipeBackActiveArea: 50,
    // Reduce threshold for easier swipe triggering
    iosSwipeBackThreshold: 0,
  },
};

/**
 * Swipe-back fix that doesn't rely on F7 events (which don't fire properly).
 * 
 * Strategy:
 * 1. Detect swipe start via swipebackMove
 * 2. Detect swipe end via touchend (since F7's swipebackAfterChange never fires)
 * 3. Wait for animation (350ms) then run cleanup ONLY if swipe was detected
 */
const setupSwipeBackFix = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    // Track swipe-back state
    let swipeBackStarted = false;
    let cleanupScheduled = false;
    let swipeBackTimestamp = 0;

    // Detect when swipe-back gesture starts
    view.on('swipebackMove', () => {
      swipeBackStarted = true;
      swipeBackTimestamp = Date.now();
    });

    // PRIMARY TRIGGER: touchend after swipe detected
    // (F7's swipebackAfterChange never fires, so we use touchend instead)
    document.addEventListener('touchend', () => {
      // Only run if swipe-back was recently detected (within last 2 seconds)
      const timeSinceSwipe = Date.now() - swipeBackTimestamp;
      
      if (swipeBackStarted && !cleanupScheduled && timeSinceSwipe < 2000) {
        cleanupScheduled = true;
        
        // Wait for animation to complete (350ms F7 default + buffer)
        setTimeout(() => {
          // Double-check that cleanup is actually needed
          if (isNavigationBlocked(view)) {
            console.log('[SwipeFix] Running cleanup after touchend');
            cleanupAfterSwipeBack(view);
          }
          swipeBackStarted = false;
          cleanupScheduled = false;
        }, 400);
      }
    }, { passive: true });

    // SAFETY NET: Check after 3 seconds if swipe was started but cleanup never ran
    // This catches edge cases without being too aggressive
    view.on('swipebackMove', () => {
      setTimeout(() => {
        if (isNavigationBlocked(view)) {
          console.log('[SwipeFix] Safety net cleanup (3s after swipe)');
          cleanupAfterSwipeBack(view);
        }
      }, 3000);
    });
  });
};

/**
 * Check if navigation is currently blocked or in a broken state
 */
const isNavigationBlocked = (view) => {
  const router = view?.router;
  if (!router) return false;

  // Check for blocking conditions
  const hasOpacityEffect = !!document.querySelector('.page-opacity-effect');
  const hasTransitioningPages = !!document.querySelector('.page-transitioning-swipeback');
  const allowPageChange = router.allowPageChange !== false;
  const transitioning = router.transitioning === true;
  
  // Also check for lingering page-previous on the main view (indicates broken state)
  const mainPage = document.querySelector('.view-main .page.main-view-page');
  const mainPageHasPrevious = mainPage?.classList.contains('page-previous') || false;

  return hasOpacityEffect || hasTransitioningPages || !allowPageChange || transitioning || mainPageHasPrevious;
};

/**
 * ULTRA-MINIMAL cleanup after swipe-back.
 * 
 * DO NOT touch the DOM pages at all! Our previous attempts to remove
 * "dismissed" pages kept removing the wrong page because F7's classes
 * don't update properly when transitionend doesn't fire.
 * 
 * Only do:
 * 1. Remove page-opacity-effect (touch blocker)
 * 2. Reset router flags
 * 3. Clear transition classes
 * 
 * Let F7 manage its own page lifecycle.
 */
const cleanupAfterSwipeBack = (view) => {
  console.log('[SwipeFix] Running ultra-minimal cleanup...');

  // 1. Remove page-opacity-effect elements (these block all touch events!)
  document.querySelectorAll('.page-opacity-effect').forEach((el) => {
    console.log('[SwipeFix] Removing page-opacity-effect');
    el.remove();
  });

  // 2. Reset router flags ONLY
  if (view.router) {
    view.router.transitioning = false;
    view.router.allowPageChange = true;
    console.log('[SwipeFix] Reset router flags');
    
    // Double-check after a delay
    setTimeout(() => {
      if (view.router) {
        view.router.transitioning = false;
        view.router.allowPageChange = true;
      }
    }, 100);
  }

  // 3. Clear view-level transition classes
  if (view.el) {
    view.el.classList.remove(
      'router-transition-forward', 
      'router-transition-backward',
      'router-transition'
    );
  }

  // 4. Clear page-level transition classes (but NOT page-current/page-previous!)
  document.querySelectorAll('.view-main .page').forEach((page) => {
    page.classList.remove(
      'page-transitioning', 
      'page-transitioning-swipeback',
      'page-swipeback-active'
    );
  });

  console.log('[SwipeFix] Ultra-minimal cleanup complete');
};

/**
 * DISABLED: This was interfering with F7's page management.
 * 
 * The periodic check was changing page classes at wrong times,
 * confusing F7's internal state.
 */
const setupMainViewPageProtection = () => {
  // Intentionally disabled - let F7 manage page classes
  console.log('[MainViewProtection] Disabled - letting F7 manage pages');
};

export default function MyApp() {
  useEffect(() => {
    // Setup swipe-back fix (works for both Despia and web environments)
    setupSwipeBackFix();
    
    // Setup protection to prevent main-view-page from getting page-previous
    setupMainViewPageProtection();
  }, []);

  return (
    <ThemeProvider>
      <App {...f7params}>
        <View
          main
          url="/"
          iosSwipeBack={true}
          browserHistory={false}
        />
        {/* Debug overlay - remove after fixing navigation issues */}
        <DebugOverlay />
      </App>
    </ThemeProvider>
  );
}
