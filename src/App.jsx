import { useEffect } from 'react';
import Framework7 from 'framework7/lite-bundle';
import Framework7React, { App, View, f7ready } from 'framework7-react';
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

// Cleanup stuck transition states after swipe-back
const setupTransitionCleanup = () => {
  f7ready((f7) => {
    const view = f7.views.main;
    if (!view) return;

    // Listen for swipe-back events and force cleanup
    view.on('swipebackMove', () => {
      // Track that a swipe is in progress
      window.__f7SwipeInProgress = true;
    });

    view.on('swipebackBeforeChange', () => {
      // Swipe will complete - cleanup after animation
      setTimeout(() => {
        cleanupTransitionClasses();
        window.__f7SwipeInProgress = false;
      }, 400);
    });

    view.on('swipebackBeforeReset', () => {
      // Swipe was cancelled - cleanup
      setTimeout(() => {
        cleanupTransitionClasses();
        window.__f7SwipeInProgress = false;
      }, 400);
    });
  });
};

// Force remove stuck transition classes
const cleanupTransitionClasses = () => {
  const transitionClasses = [
    'page-transitioning',
    'page-transitioning-swipeback',
    'router-transition-forward',
    'router-transition-backward',
  ];

  document.querySelectorAll('.page').forEach((page) => {
    transitionClasses.forEach((cls) => page.classList.remove(cls));
  });

  // Also remove page-opacity-effect if it exists
  document.querySelectorAll('.page-opacity-effect').forEach((el) => {
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  });
};

export default function MyApp() {
  useEffect(() => {
    setupTransitionCleanup();
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
