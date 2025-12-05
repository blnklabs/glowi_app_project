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
 * Middle-ground cleanup after swipe-back.
 * 
 * F7's swipebackAfterChange never fires, so we need to manually:
 * 1. Remove the dismissed page (any page NOT marked as page-current)
 * 2. Remove page-opacity-effect (blocks touch events)
 * 3. Reset router flags
 * 
 * IMPORTANT: Do NOT touch router.history or router.currentRoute!
 * That breaks F7's gesture recognizer.
 */
const cleanupAfterSwipeBack = (view) => {
  console.log('[SwipeFix] Running cleanup...');

  // 1. Remove page-opacity-effect elements (these block all touch events!)
  document.querySelectorAll('.page-opacity-effect').forEach((el) => {
    console.log('[SwipeFix] Removing page-opacity-effect');
    el.remove();
  });

  // 2. Find and remove dismissed pages (pages that are NOT page-current)
  // After swipe-back, the destination page should be page-current
  // The dismissed page (that was swiped away) should be removed
  const allPages = document.querySelectorAll('.view-main .page');
  const currentPage = document.querySelector('.view-main .page.page-current');
  
  if (currentPage && allPages.length > 1) {
    allPages.forEach((page) => {
      if (page !== currentPage) {
        console.log('[SwipeFix] Removing dismissed page:', page.className);
        page.remove();
      }
    });
  }

  // 3. Reset router flags - but NOT history or currentRoute
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

  // 4. Clear view-level transition classes
  if (view.el) {
    view.el.classList.remove(
      'router-transition-forward', 
      'router-transition-backward',
      'router-transition'
    );
  }

  // 5. Clear page-level transition classes from remaining page
  if (currentPage) {
    currentPage.classList.remove(
      'page-transitioning', 
      'page-transitioning-swipeback',
      'page-swipeback-active'
    );
    currentPage.style.transform = '';
    currentPage.style.opacity = '';
  }

  console.log('[SwipeFix] Cleanup complete');
};

/**
 * Safety net: If main-view-page gets stuck with page-previous when we're on root,
 * fix it. But be very careful not to interfere with normal F7 operation.
 * 
 * Only acts when:
 * 1. We're on root URL (/)
 * 2. NOT transitioning
 * 3. main-view-page has page-previous (wrong state)
 */
const setupMainViewPageProtection = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    // Check periodically instead of using MutationObserver
    // MutationObserver was too aggressive and interfered with F7
    setInterval(() => {
      const currentUrl = view.router?.currentRoute?.url || '/';
      const isOnRootPage = currentUrl === '/' || currentUrl.startsWith('/?');
      
      if (!isOnRootPage) return; // Don't interfere when on deeper pages
      
      const mainViewPage = document.querySelector('.main-view-page');
      if (!mainViewPage) return;
      
      // Check if stuck in wrong state
      const hasPagePrevious = mainViewPage.classList.contains('page-previous');
      const isTransitioning = mainViewPage.classList.contains('page-transitioning') ||
                              mainViewPage.classList.contains('page-transitioning-swipeback') ||
                              view.router.transitioning;
      
      if (hasPagePrevious && !isTransitioning) {
        // We're on root but main-view-page has page-previous - fix it
        mainViewPage.classList.remove('page-previous');
        mainViewPage.classList.add('page-current');
        mainViewPage.style.transform = '';
        console.log('[MainViewProtection] Fixed stuck page-previous on root');
      }
    }, 1000); // Check every second
  });
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
