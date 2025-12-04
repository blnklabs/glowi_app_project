import { useState, useEffect } from 'react';
import { f7ready } from 'framework7-react';
import { isDespia } from '../utils/despia.js';

/**
 * Debug overlay component that displays real-time navigation state.
 * Shows router state, page classes, and event logs.
 */
export default function DebugOverlay() {
  const [debugState, setDebugState] = useState({
    isDespia: false,
    routerTransitioning: false,
    allowPageChange: true,
    historyLength: 0,
    currentUrl: '/',
    pageClasses: [],
    tabsClasses: '',
    hasOpacityEffect: false,
    pageCount: 0,
    eventLog: [],
  });

  useEffect(() => {
    // Initial state
    setDebugState(prev => ({
      ...prev,
      isDespia: isDespia(),
    }));

    // Update function
    const updateDebugState = (eventName = null) => {
      f7ready((f7) => {
        const view = f7.views.main;
        if (!view) return;

        const router = view.router;
        const pages = document.querySelectorAll('.view-main .page');
        const pageClasses = [];

        pages.forEach((page, i) => {
          const classList = Array.from(page.classList).filter(c => 
            c.includes('page-') || c.includes('transitioning') || c.includes('swipeback')
          );
          // Also get z-index
          const zIndex = window.getComputedStyle(page).zIndex;
          pageClasses.push(`P${i}(z:${zIndex}): ${classList.join(' ')}`);
        });

        // Get .tabs element info
        const tabsEl = document.querySelector('.tabs');
        const tabsClasses = tabsEl 
          ? Array.from(tabsEl.classList).join(' ')
          : 'not found';

        // Get active tab info
        const activeTab = document.querySelector('.tab.tab-active');
        const activeTabId = activeTab ? activeTab.id : 'none';

        const hasOpacityEffect = !!document.querySelector('.page-opacity-effect');
        const pageCount = pages.length;

        setDebugState(prev => {
          const newLog = eventName 
            ? [...prev.eventLog.slice(-9), `${new Date().toLocaleTimeString()}: ${eventName}`]
            : prev.eventLog;

          return {
            ...prev,
            routerTransitioning: router?.transitioning || false,
            allowPageChange: router?.allowPageChange ?? true,
            historyLength: router?.history?.length || 0,
            currentUrl: router?.currentRoute?.url || '/',
            pageClasses,
            tabsClasses: `${tabsClasses} | active: ${activeTabId}`,
            hasOpacityEffect,
            pageCount,
            eventLog: newLog,
          };
        });
      });
    };

    // Initial update
    updateDebugState();

    // Set up F7 event listeners
    f7ready((f7) => {
      const view = f7.views.main;
      if (!view) return;

      // Swipe-back events
      view.on('swipebackMove', () => {
        updateDebugState('swipebackMove');
      });

      view.on('swipebackBeforeChange', () => {
        updateDebugState('swipebackBeforeChange');
      });

      view.on('swipebackAfterChange', () => {
        updateDebugState('swipebackAfterChange');
      });

      view.on('swipebackBeforeReset', () => {
        updateDebugState('swipebackBeforeReset');
      });

      view.on('swipebackAfterReset', () => {
        updateDebugState('swipebackAfterReset');
      });

      // Router events
      view.router.on('routeChange', () => {
        updateDebugState('routeChange');
      });

      view.router.on('routeChanged', () => {
        updateDebugState('routeChanged');
      });

      // Page events
      view.on('pageBeforeIn', () => {
        updateDebugState('pageBeforeIn');
      });

      view.on('pageAfterIn', () => {
        updateDebugState('pageAfterIn');
      });

      view.on('pageBeforeOut', () => {
        updateDebugState('pageBeforeOut');
      });

      view.on('pageAfterOut', () => {
        updateDebugState('pageAfterOut');
      });
    });

    // Listen for popstate
    const handlePopState = () => {
      updateDebugState('POPSTATE');
    };
    window.addEventListener('popstate', handlePopState);

    // Listen for clicks
    const handleClick = (e) => {
      const target = e.target.closest('a, button, .ios-list-item-link, .ios-tabbar-item');
      if (target) {
        const href = target.getAttribute('href') || target.closest('[href]')?.getAttribute('href');
        updateDebugState(`CLICK: ${href || target.className.slice(0, 20)}`);
      }
    };
    document.addEventListener('click', handleClick, true);

    // Periodic refresh
    const interval = setInterval(() => updateDebugState(), 500);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
      clearInterval(interval);
    };
  }, []);

  const { 
    isDespia: inDespia, 
    routerTransitioning, 
    allowPageChange, 
    historyLength, 
    currentUrl, 
    pageClasses, 
    tabsClasses,
    hasOpacityEffect,
    pageCount,
    eventLog 
  } = debugState;

  // Status indicators - also check if multiple pages exist (potential z-index issue)
  const isBlocked = routerTransitioning || !allowPageChange || hasOpacityEffect;
  const hasMultiplePages = pageCount > 1;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#fff',
      padding: '12px',
      borderRadius: '12px',
      fontSize: '10px',
      fontFamily: 'monospace',
      zIndex: 99999,
      maxWidth: '90vw',
      maxHeight: '60vh',
      overflow: 'auto',
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#0af' }}>
        🔍 DEBUG
      </div>

      {/* Status Banner */}
      <div style={{
        background: isBlocked ? '#f33' : '#0c0',
        padding: '4px 8px',
        borderRadius: '4px',
        marginBottom: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}>
        {isBlocked ? '⛔ NAVIGATION BLOCKED' : '✅ NAVIGATION OK'}
      </div>

      {/* Environment */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>ENV:</span>{' '}
        <span style={{ color: inDespia ? '#0f0' : '#ff0' }}>
          {inDespia ? 'Despia Native' : 'Web Browser'}
        </span>
      </div>

      {/* Router State */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>transitioning:</span>{' '}
        <span style={{ color: routerTransitioning ? '#f33' : '#0f0' }}>
          {String(routerTransitioning)}
        </span>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>allowPageChange:</span>{' '}
        <span style={{ color: allowPageChange ? '#0f0' : '#f33' }}>
          {String(allowPageChange)}
        </span>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>opacityEffect:</span>{' '}
        <span style={{ color: hasOpacityEffect ? '#f33' : '#0f0' }}>
          {String(hasOpacityEffect)}
        </span>
      </div>

      {/* Route Info */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>URL:</span>{' '}
        <span style={{ color: '#0af' }}>{currentUrl}</span>
        <span style={{ color: '#888' }}> (hist: {historyLength})</span>
      </div>

      {/* Page Count Warning */}
      {hasMultiplePages && (
        <div style={{ 
          marginBottom: '6px',
          color: '#f93',
          fontWeight: 'bold',
        }}>
          ⚠️ {pageCount} pages in DOM (may cause z-index issues)
        </div>
      )}

      {/* Page Classes with z-index */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ color: '#888', marginBottom: '2px' }}>Pages:</div>
        {pageClasses.map((pc, i) => (
          <div key={i} style={{ 
            color: pc.includes('transitioning') || pc.includes('swipeback') ? '#f93' : 
                   pc.includes('page-previous') ? '#f66' : 
                   pc.includes('page-current') ? '#0f0' : '#aaa',
            fontSize: '9px',
            marginLeft: '8px',
          }}>
            {pc}
          </div>
        ))}
      </div>

      {/* Tabs Info */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>Tabs:</span>{' '}
        <span style={{ color: '#0af', fontSize: '9px' }}>{tabsClasses}</span>
      </div>

      {/* Event Log */}
      <div>
        <div style={{ color: '#888', marginBottom: '2px' }}>Events:</div>
        <div style={{ 
          maxHeight: '80px', 
          overflow: 'auto',
          background: 'rgba(255,255,255,0.1)',
          padding: '4px',
          borderRadius: '4px',
        }}>
          {eventLog.length === 0 ? (
            <div style={{ color: '#666' }}>No events yet</div>
          ) : (
            eventLog.map((event, i) => (
              <div key={i} style={{ 
                color: event.includes('POPSTATE') ? '#0f0' : 
                       event.includes('CLICK') ? '#0af' :
                       event.includes('swipeback') ? '#f93' : '#aaa',
                fontSize: '9px',
              }}>
                {event}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

