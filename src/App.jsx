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
      
      // Wait for animation to complete (350ms F7 default + buffer)
      setTimeout(() => {
        console.log('[SwipeFix] Running cleanup after swipebackBeforeChange');
        cleanupAfterSwipeBack(view);
        cleanupScheduled = false;
      }, 400);
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
 * Since F7's swipebackAfterChange never fires in Despia, it never removes
 * the dismissed page from DOM. We need to do that manually.
 * 
 * We DO:
 * 1. Remove page-opacity-effect (blocks all touches)
 * 2. Remove dismissed pages (pages without page-current class)
 * 3. Reset router.transitioning and router.allowPageChange
 * 4. Clear stuck transition CSS classes
 * 
 * We DO NOT:
 * - Reset router history (F7 manages this correctly via swipebackBeforeChange)
 * - Change page-current/page-previous classes (F7 sets these correctly)
 */
const cleanupAfterSwipeBack = (view) => {
  console.log('[SwipeFix] Cleanup starting...');

  // 1. Remove page-opacity-effect elements (these block all touch events!)
  const opacityEffects = document.querySelectorAll('.page-opacity-effect');
  if (opacityEffects.length > 0) {
    opacityEffects.forEach((el) => el.remove());
    console.log('[SwipeFix] Removed', opacityEffects.length, 'opacity effects');
  }

  // 2. Remove dismissed pages from DOM
  // After swipe-back, the page we came FROM should be removed
  // The page-current class indicates which page is the destination
  const pages = Array.from(document.querySelectorAll('.view-main .page'));
  const currentPage = document.querySelector('.view-main .page.page-current');
  
  if (currentPage && pages.length > 1) {
    pages.forEach((page) => {
      if (page !== currentPage) {
        console.log('[SwipeFix] Removing dismissed page:', page.className.slice(0, 50));
        page.remove();
      }
    });
  }

  // 3. Reset router flags
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

  // 4. Clear view-level transition classes
  if (view.el) {
    view.el.classList.remove(
      'router-transition-forward', 
      'router-transition-backward',
      'router-transition'
    );
  }

  // 5. Clear stuck transition classes from remaining pages
  document.querySelectorAll('.view-main .page').forEach((page) => {
    page.classList.remove(
      'page-transitioning', 
      'page-transitioning-swipeback',
      'page-swipeback-active'
    );
  });

  console.log('[SwipeFix] Cleanup complete');
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
