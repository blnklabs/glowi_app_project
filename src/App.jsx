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
 * Manual cleanup that fixes the corrupted state after swipe-back.
 * 
 * Based on real device debug analysis:
 * - allowPageChange gets stuck as false
 * - Destination page keeps page-previous class instead of page-current
 * - Router URL doesn't update to match actual page
 * - page-swipeback-active class lingers
 * - main-view-page specifically retains page-previous after animation
 */
const cleanupAfterSwipeBack = (view) => {
  console.log('[SwipeFix] Starting cleanup...');

  // 1. Remove page-opacity-effect elements (these block all touch events!)
  document.querySelectorAll('.page-opacity-effect').forEach((el) => {
    console.log('[SwipeFix] Removing page-opacity-effect');
    el.remove();
  });

  // 2. Get all pages and identify which to keep vs remove
  const pages = Array.from(document.querySelectorAll('.view-main .page'));
  console.log('[SwipeFix] Found', pages.length, 'pages');
  
  if (pages.length > 1) {
    // The page we're going BACK to is the first/underlying page (index 0)
    // The page being DISMISSED is the top page (last index)
    const dismissedPages = pages.slice(1);

    // Remove all dismissed pages
    dismissedPages.forEach((page, i) => {
      console.log(`[SwipeFix] Removing dismissed page ${i + 1}`);
      page.remove();
    });
  }

  // 3. Fix ALL remaining pages - ensure exactly one is page-current
  const remainingPages = Array.from(document.querySelectorAll('.view-main .page'));
  remainingPages.forEach((page, index) => {
    // Log current state before cleanup
    console.log('[SwipeFix] Page classes before:', page.className);
    
    // Remove ALL state classes first
    page.classList.remove(
      'page-previous',
      'page-next',
      'page-current',
      'page-transitioning',
      'page-transitioning-swipeback',
      'page-swipeback-active'
    );
    
    // The first (and should be only) page becomes current
    if (index === 0) {
      page.classList.add('page-current');
      console.log('[SwipeFix] Set page-current on remaining page');
    }
    
    // Clear inline styles
    page.style.transform = '';
    page.style.opacity = '';
    
    // Log current state after cleanup
    console.log('[SwipeFix] Page classes after:', page.className);
  });

  // 4. SPECIFICALLY fix .main-view-page if it still has page-previous
  // (This is the root cause of tabs being unreachable)
  const mainViewPage = document.querySelector('.main-view-page');
  if (mainViewPage) {
    const hadPrevious = mainViewPage.classList.contains('page-previous');
    mainViewPage.classList.remove('page-previous', 'page-next', 'page-transitioning', 'page-transitioning-swipeback', 'page-swipeback-active');
    if (!mainViewPage.classList.contains('page-current')) {
      mainViewPage.classList.add('page-current');
    }
    mainViewPage.style.transform = '';
    mainViewPage.style.opacity = '';
    if (hadPrevious) {
      console.log('[SwipeFix] Fixed main-view-page: removed page-previous, added page-current');
    }
  }

  // 5. Reset router state - FORCE these values
  if (view.router) {
    // Force reset transitioning state
    view.router.transitioning = false;
    
    // CRITICAL: Force allowPageChange to true
    view.router.allowPageChange = true;
    
    // Update history to match actual state
    if (view.router.history.length > 1) {
      // Pop until we're at the root
      const newHistory = [view.router.history[0]]; // Keep only root
      view.router.history = newHistory;
      console.log('[SwipeFix] Reset history to:', newHistory);
    }
    
    // Update currentRoute to match the first history entry
    if (view.router.history.length > 0) {
      const currentPath = view.router.history[view.router.history.length - 1];
      // Find the matching route
      const matchingRoute = view.router.findMatchingRoute(currentPath);
      if (matchingRoute) {
        view.router.currentRoute = matchingRoute;
        view.router.previousRoute = null;
        console.log('[SwipeFix] Updated currentRoute to:', currentPath);
      }
    }
    
    // Double-check allowPageChange is true (in case something reset it)
    setTimeout(() => {
      if (view.router) {
        view.router.allowPageChange = true;
        view.router.transitioning = false;
      }
      // Also re-check main-view-page
      const mvp = document.querySelector('.main-view-page');
      if (mvp && mvp.classList.contains('page-previous')) {
        mvp.classList.remove('page-previous');
        mvp.classList.add('page-current');
        console.log('[SwipeFix] Secondary fix for main-view-page');
      }
    }, 100);
  }

  // 6. Clear view-level transition classes
  if (view.el) {
    view.el.classList.remove(
      'router-transition-forward', 
      'router-transition-backward',
      'router-transition'
    );
  }

  console.log('[SwipeFix] Cleanup complete, allowPageChange:', view.router?.allowPageChange);
};

/**
 * Prevent F7 from incorrectly adding page-previous to main-view-page.
 * Uses MutationObserver to immediately remove the class when added.
 */
const setupMainViewPageProtection = () => {
  // Wait for DOM to be ready
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        // Check if this is the main-view-page and it has page-previous
        if (target.classList.contains('main-view-page') && 
            target.classList.contains('page-previous')) {
          // Remove page-previous and ensure page-current
          target.classList.remove('page-previous');
          if (!target.classList.contains('page-current')) {
            target.classList.add('page-current');
          }
          // Clear any transforms
          target.style.transform = '';
          console.log('[MainViewProtection] Removed page-previous from main-view-page');
        }
      }
    });
  });

  // Start observing once DOM is ready
  const startObserving = () => {
    const mainViewPage = document.querySelector('.main-view-page');
    if (mainViewPage) {
      observer.observe(mainViewPage, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      console.log('[MainViewProtection] Observer started');
    } else {
      // Retry after a short delay
      setTimeout(startObserving, 100);
    }
  };

  startObserving();
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
