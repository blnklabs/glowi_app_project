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
 * 3. Wait for animation (350ms) then run MINIMAL cleanup
 * 
 * IMPORTANT: We removed the 3-second safety net because it was firing
 * multiple times (once per swipebackMove) and interfering with F7.
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
          // Only cleanup if there's something blocking
          if (isNavigationBlocked(view)) {
            console.log('[SwipeFix] Running cleanup after touchend');
            cleanupAfterSwipeBack(view);
          }
          swipeBackStarted = false;
          cleanupScheduled = false;
        }, 400);
      }
    }, { passive: true });
    
    // NO SAFETY NET - it was firing multiple times and breaking things
  });
};

/**
 * Check if navigation is currently blocked
 * Only checks for actual blocking conditions, not F7's normal page states
 */
const isNavigationBlocked = (view) => {
  const router = view?.router;
  if (!router) return false;

  // Only check for actual blocking conditions
  const hasOpacityEffect = !!document.querySelector('.page-opacity-effect');
  const hasTransitioningPages = !!document.querySelector('.page-transitioning-swipeback');
  const isTransitioning = router.transitioning === true;
  const isBlocked = router.allowPageChange === false;

  return hasOpacityEffect || hasTransitioningPages || isTransitioning || isBlocked;
};

/**
 * MINIMAL cleanup after swipe-back.
 * 
 * Strategy: Only fix what's absolutely necessary, let F7 manage its own
 * page lifecycle and history. Being too aggressive breaks subsequent swipes.
 * 
 * We ONLY:
 * 1. Remove page-opacity-effect (blocks all touches)
 * 2. Reset router.transitioning and router.allowPageChange
 * 3. Clear stuck transition CSS classes
 * 
 * We DO NOT:
 * - Remove pages from DOM (F7 manages this)
 * - Reset router history (F7 manages this)
 * - Change page-current/page-previous classes (F7 manages this)
 */
const cleanupAfterSwipeBack = (view) => {
  console.log('[SwipeFix] Minimal cleanup starting...');

  // 1. Remove page-opacity-effect elements (these block all touch events!)
  const opacityEffects = document.querySelectorAll('.page-opacity-effect');
  if (opacityEffects.length > 0) {
    opacityEffects.forEach((el) => el.remove());
    console.log('[SwipeFix] Removed', opacityEffects.length, 'opacity effects');
  }

  // 2. Reset router flags ONLY - let F7 manage everything else
  if (view.router) {
    view.router.transitioning = false;
    view.router.allowPageChange = true;
    console.log('[SwipeFix] Reset router flags');
    
    // Double-check after a delay (in case F7 resets them)
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

  // 4. Clear stuck transition classes from pages (but NOT page-current/page-previous!)
  document.querySelectorAll('.view-main .page').forEach((page) => {
    page.classList.remove(
      'page-transitioning', 
      'page-transitioning-swipeback',
      'page-swipeback-active'
    );
  });

  console.log('[SwipeFix] Minimal cleanup complete');
};

/**
 * DISABLED: MutationObserver was interfering with F7's page management.
 * 
 * The CSS overrides in index.css handle the visual issues, and the
 * minimal cleanup handles the router state. We don't need to actively
 * modify page classes anymore.
 */
const setupMainViewPageProtection = () => {
  console.log('[MainViewProtection] Disabled - relying on CSS overrides');
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
