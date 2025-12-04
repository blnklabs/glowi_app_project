import { useEffect } from 'react';
import Framework7 from 'framework7/lite-bundle';
import Framework7React, { App, View, f7ready, f7 } from 'framework7-react';
import routes from './routes.js';
import { ThemeProvider } from './context/ThemeContext';

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

// Comprehensive cleanup after swipe-back
const setupSwipeBackFix = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    // Use swipebackAfterChange - fires AFTER swipe-back animation completes
    view.on('swipebackAfterChange', () => {
      // Small delay to ensure F7 has finished its internal updates
      setTimeout(() => {
        forceCleanupAfterSwipe(view);
      }, 50);
    });

    // Also cleanup after reset (cancelled swipe)
    view.on('swipebackAfterReset', () => {
      setTimeout(() => {
        forceCleanupAfterSwipe(view);
      }, 50);
    });
  });
};

// Force complete cleanup after swipe
const forceCleanupAfterSwipe = (view) => {
  // 1. Remove all transition classes from pages
  const transitionClasses = [
    'page-transitioning',
    'page-transitioning-swipeback',
    'page-next',
    'router-transition-forward',
    'router-transition-backward',
  ];

  document.querySelectorAll('.page').forEach((page) => {
    transitionClasses.forEach((cls) => page.classList.remove(cls));
    // Reset any inline transforms
    page.style.transform = '';
  });

  // 2. Remove page-opacity-effect elements entirely
  document.querySelectorAll('.page-opacity-effect').forEach((el) => {
    el.remove();
  });

  // 3. Ensure current page has correct classes
  const currentPage = document.querySelector('.page-current');
  if (currentPage) {
    currentPage.classList.remove('page-previous');
    currentPage.style.transform = '';
  }

  // 4. Remove any leftover "previous" pages that shouldn't exist
  document.querySelectorAll('.page-previous').forEach((page) => {
    // If this page is not in the router history, it's stale - hide it
    page.style.transform = 'translate3d(-100%, 0, 0)';
    page.setAttribute('aria-hidden', 'true');
  });

  // 5. Clear the view's transitioning state
  if (view.router) {
    view.router.transitioning = false;
  }
};

export default function MyApp() {
  useEffect(() => {
    setupSwipeBackFix();
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
      </App>
    </ThemeProvider>
  );
}
