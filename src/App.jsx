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

// Fallback cleanup for swipe-back when transitionend doesn't fire (WebView environments)
const setupSwipeBackFix = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

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
  });
};

// Manual cleanup that mimics what F7 would do if transitionend had fired
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
