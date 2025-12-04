import { useEffect } from 'react';
import Framework7 from 'framework7/lite-bundle';
import Framework7React, { App, View, f7ready, f7 } from 'framework7-react';
import routes from './routes.js';
import { ThemeProvider } from './context/ThemeContext';
import { isDespia, onNativeBackGesture } from './utils/despia.js';

Framework7.use(Framework7React);

const f7params = {
  name: 'Starter App',
  theme: 'ios',
  routes: routes,
  view: {
    iosDynamicNavbar: true,
    animate: true,
  },
};

/**
 * Setup navigation handling for Despia native environment.
 * 
 * Strategy:
 * - DISABLE F7's built-in swipe-back (iosSwipeBack={false})
 * - Let Despia's native swipe gesture trigger popstate/history.back()
 * - Listen for popstate and call F7's router.back() directly
 * - F7's router.back() handles all state cleanup internally (no transitionend dependency)
 */
const setupDespiaNavigation = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    // Only setup if running in Despia native environment
    if (!isDespia()) return;

    // Flag to prevent double-back navigation
    let isNavigatingBack = false;

    // Listen for popstate events (Despia's native swipe triggers history.back())
    const handlePopState = () => {
      if (isNavigatingBack) return;
      
      const router = view.router;
      if (!router) return;

      // Check if we have history to go back
      if (router.history.length > 1) {
        isNavigatingBack = true;
        
        // Use F7's router.back() which handles cleanup properly
        router.back({
          animate: true,
          force: false,
        });

        // Reset flag after navigation completes
        setTimeout(() => {
          isNavigatingBack = false;
        }, 400);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });
};

/**
 * Fallback swipe-back fix for when F7's swipe-back is enabled.
 * Uses multiple cleanup triggers to ensure state is properly reset.
 */
const setupSwipeBackFix = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    // Skip if in Despia - we use the native navigation approach instead
    if (isDespia()) return;

    // Track when swipe-back gesture starts
    let swipeBackInProgress = false;

    view.on('swipebackMove', () => {
      swipeBackInProgress = true;
    });

    // After swipe-back will complete, wait for animation then run cleanup
    view.on('swipebackAfterChange', () => {
      if (swipeBackInProgress) {
        swipeBackInProgress = false;
        // Wait 350ms (F7's default transition duration) for animation to finish
        setTimeout(() => {
          cleanupAfterSwipeBack(view);
        }, 350);
      }
    });

    // Reset tracking if swipe is cancelled
    view.on('swipebackAfterReset', () => {
      swipeBackInProgress = false;
    });

    // Also cleanup on touchend after swipe detection (fallback trigger)
    document.addEventListener('touchend', () => {
      if (swipeBackInProgress) {
        // Wait one frame, then check if cleanup is needed
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (document.querySelector('.page-transitioning-swipeback')) {
              cleanupAfterSwipeBack(view);
            }
            swipeBackInProgress = false;
          }, 400);
        });
      }
    }, { passive: true });
  });
};

/**
 * Manual cleanup that mimics what F7 would do if transitionend had fired.
 * Runs in this specific order to avoid state corruption.
 */
const cleanupAfterSwipeBack = (view) => {
  // 1. Remove the stale page (the one being dismissed)
  // This is the page with page-transitioning-swipeback but NOT page-previous
  const stalePage = document.querySelector('.page-transitioning-swipeback:not(.page-previous)');
  if (stalePage) {
    stalePage.remove();
  }

  // 2. Promote page-previous to page-current
  const previousPage = document.querySelector('.page-previous');
  if (previousPage) {
    previousPage.classList.remove(
      'page-previous',
      'page-transitioning',
      'page-transitioning-swipeback'
    );
    previousPage.classList.add('page-current');
    previousPage.style.transform = '';
    previousPage.style.opacity = '';
  }

  // 3. Remove page-opacity-effect elements (these block touch events)
  document.querySelectorAll('.page-opacity-effect').forEach((el) => {
    el.remove();
  });

  // 4. Clear transition classes from all remaining pages
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove(
      'page-transitioning',
      'page-transitioning-swipeback',
      'page-next'
    );
  });

  // 5. Reset router state so it accepts new navigation
  if (view.router) {
    view.router.transitioning = false;
    view.router.allowPageChange = true;
  }

  // 6. Clear view-level transition classes
  if (view.el) {
    view.el.classList.remove('router-transition-forward', 'router-transition-backward');
  }
};

export default function MyApp() {
  useEffect(() => {
    // Setup Despia-specific navigation (popstate handler)
    setupDespiaNavigation();
    
    // Setup fallback swipe-back fix for non-Despia environments
    setupSwipeBackFix();
  }, []);

  // Determine if we should use F7's swipe-back or Despia's native gesture
  // In Despia: disable F7 swipe, let Despia handle it via popstate
  // In web: enable F7 swipe with cleanup fallback
  const useF7SwipeBack = typeof window !== 'undefined' ? !isDespia() : true;

  return (
    <ThemeProvider>
      <App {...f7params}>
        <View
          main
          url="/"
          iosSwipeBack={useF7SwipeBack}
          browserHistory={false}
        />
      </App>
    </ThemeProvider>
  );
}
