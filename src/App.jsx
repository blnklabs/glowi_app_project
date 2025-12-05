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
 * Swipe-back fix for Despia WebView where F7's transitionend events don't fire.
 * 
 * Key insight: swipebackBeforeChange DOES fire, but swipebackAfterChange doesn't.
 * We use swipebackBeforeChange as our primary trigger.
 * 
 * Strategy:
 * 1. Listen for swipebackBeforeChange (fires reliably)
 * 2. Wait for animation to complete (400ms)
 * 3. Remove dismissed pages and reset router flags
 * 4. DON'T touch router history (let F7 manage that)
 */
const setupSwipeBackFix = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    let cleanupScheduled = false;

    // PRIMARY TRIGGER: swipebackBeforeChange (this DOES fire in Despia!)
    view.on('swipebackBeforeChange', () => {
      if (cleanupScheduled) return;
      cleanupScheduled = true;

      console.log('[SwipeFix] swipebackBeforeChange fired, scheduling cleanup');

      // Wait for swipeback animation to complete (300ms per F7 CSS) + buffer
      // Then check if cleanup is actually needed
      setTimeout(() => {
        console.log('[SwipeFix] Running cleanup check after swipebackBeforeChange');
        cleanupAfterSwipeBack(view);
        cleanupScheduled = false;
      }, 350);
    });

    // SAFETY NET: Also listen for swipebackAfterChange to clear our flag
    // If this fires, F7 handled it naturally and we don't need to do anything
    view.on('swipebackAfterChange', () => {
      console.log('[SwipeFix] swipebackAfterChange fired - F7 handled naturally');
      cleanupScheduled = false;
    });

    // BACKUP TRIGGER: touchend after swipebackMove (in case swipebackBeforeChange doesn't fire)
    let swipeBackStarted = false;
    let swipeBackTimestamp = 0;

    view.on('swipebackMove', () => {
      swipeBackStarted = true;
      swipeBackTimestamp = Date.now();
    });

    document.addEventListener('touchend', () => {
      const timeSinceSwipe = Date.now() - swipeBackTimestamp;
      
      // Only run if swipe was detected, cleanup not already scheduled, and recent
      if (swipeBackStarted && !cleanupScheduled && timeSinceSwipe < 2000) {
        cleanupScheduled = true;
        
        setTimeout(() => {
          if (isNavigationBlocked(view)) {
            console.log('[SwipeFix] Running cleanup after touchend (backup)');
            cleanupAfterSwipeBack(view);
          }
          swipeBackStarted = false;
          cleanupScheduled = false;
        }, 400);
      }
    }, { passive: true });
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
 * Cleanup after swipe-back completes.
 *
 * ROOT CAUSE: F7's swipeback uses a closure variable `allowViewTouchMove` that gets
 * set to `false` when swipe completes (line 183 in swipe-back.js) and only resets to
 * `true` inside a transitionEnd callback (line 213). If transitionEnd never fires
 * (Despia WebView issue), this variable stays false and blocks ALL future swipe-backs.
 *
 * SOLUTION: Dispatch a synthetic transitionend event on the transitioning page element.
 * This triggers F7's internal callback which resets `allowViewTouchMove = true`.
 */
const cleanupAfterSwipeBack = (view) => {
  console.log('[SwipeFix] Cleanup starting...');

  // Check if cleanup is actually needed - F7 might have handled it naturally
  const router = view.router;
  if (router && router.allowPageChange === true) {
    console.log('[SwipeFix] allowPageChange is true, F7 handled cleanup naturally');
    return;
  }

  // CRITICAL FIX: Dispatch transitionend event to unlock F7's internal allowViewTouchMove
  // F7 listens for transitionend on $currentPageEl (the page being swiped away).
  // After swipe completes, this page has classes: page-next + page-transitioning-swipeback
  // (See swipe-back.js lines 169 and 177)
  const dismissedPage = document.querySelector('.view-main .page.page-next.page-transitioning-swipeback');
  if (dismissedPage) {
    console.log('[SwipeFix] Dispatching transitionend to unlock allowViewTouchMove');
    const transitionEndEvent = new TransitionEvent('transitionend', {
      propertyName: 'transform',
      bubbles: true,
      cancelable: false,
    });
    dismissedPage.dispatchEvent(transitionEndEvent);
    console.log('[SwipeFix] transitionend dispatched, F7 should now reset internal state');
    // F7's callback will handle everything else - don't interfere
    return;
  }

  // Try alternate selector - page might just have page-transitioning-swipeback without page-next
  const altPage = document.querySelector('.view-main .page.page-transitioning-swipeback');
  if (altPage) {
    console.log('[SwipeFix] Dispatching transitionend (alt selector)');
    const transitionEndEvent = new TransitionEvent('transitionend', {
      propertyName: 'transform',
      bubbles: true,
      cancelable: false,
    });
    altPage.dispatchEvent(transitionEndEvent);
    console.log('[SwipeFix] transitionend dispatched (alt), F7 should handle cleanup');
    return;
  }

  // FALLBACK: No transitioning page found, do manual cleanup
  // This happens if the page classes were already cleared somehow
  console.log('[SwipeFix] No transitioning page found, doing manual cleanup');

  // Remove page-opacity-effect elements (these block all touch events!)
  const opacityEffects = document.querySelectorAll('.page-opacity-effect');
  if (opacityEffects.length > 0) {
    opacityEffects.forEach((el) => el.remove());
    console.log('[SwipeFix] Removed', opacityEffects.length, 'opacity effects');
  }

  // Reset router flags
  if (router) {
    router.transitioning = false;
    router.allowPageChange = true;
    router.swipeBackActive = false;
    console.log('[SwipeFix] Reset router flags manually');
  }

  // Clear view-level transition classes
  if (view.el) {
    view.el.classList.remove(
      'router-transition-forward',
      'router-transition-backward',
      'router-transition'
    );
  }

  console.log('[SwipeFix] Manual cleanup complete, history length:', router?.history.length);
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
