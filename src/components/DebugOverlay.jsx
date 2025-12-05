import { useState, useEffect } from 'react';
import { f7ready } from 'framework7-react';
import { isDespia } from '../utils/despia.js';

/**
 * Comprehensive debug overlay component.
 * Shows real-time navigation state, events, and cleanup activity.
 */
export default function DebugOverlay() {
  const [debugState, setDebugState] = useState({
    isDespia: false,
    routerTransitioning: false,
    allowPageChange: true,
    historyStack: [],
    currentUrl: '/',
    pageClasses: [],
    hasOpacityEffect: false,
    eventLog: [],
    cleanupLog: [],
    gestureState: 'idle', // idle, swiping, completed, cancelled
  });

  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Initial state
    setDebugState(prev => ({
      ...prev,
      isDespia: isDespia(),
    }));

    // Update function
    const updateDebugState = (eventName = null, category = 'event') => {
      f7ready((f7) => {
        const view = f7.views.main;
        if (!view) return;

        const router = view.router;
        const pages = document.querySelectorAll('.page');
        const pageClasses = [];

        pages.forEach((page, i) => {
          const classList = Array.from(page.classList).filter(c => 
            c.includes('page-') || c.includes('transitioning') || c.includes('swipe') || c === 'main-view-page'
          );
          pageClasses.push(`P${i}: ${classList.join(' ')}`);
        });

        const hasOpacityEffect = !!document.querySelector('.page-opacity-effect');

        setDebugState(prev => {
          const timestamp = new Date().toLocaleTimeString();
          let newEventLog = prev.eventLog;
          let newCleanupLog = prev.cleanupLog;

          if (eventName) {
            const entry = `${timestamp}: ${eventName}`;
            if (category === 'cleanup') {
              newCleanupLog = [...prev.cleanupLog.slice(-9), entry];
            } else {
              newEventLog = [...prev.eventLog.slice(-14), entry];
            }
          }

          return {
            ...prev,
            routerTransitioning: router?.transitioning || false,
            allowPageChange: router?.allowPageChange ?? true,
            historyStack: router?.history ? [...router.history] : [],
            currentUrl: router?.currentRoute?.url || '/',
            pageClasses,
            hasOpacityEffect,
            eventLog: newEventLog,
            cleanupLog: newCleanupLog,
          };
        });
      });
    };

    // Update gesture state
    const setGestureState = (state) => {
      setDebugState(prev => ({ ...prev, gestureState: state }));
    };

    // Initial update
    updateDebugState();

    // Set up F7 event listeners
    f7ready((f7) => {
      const view = f7.views.main;
      if (!view) return;

      // Swipe-back gesture events
      view.on('swipebackMove', () => {
        setGestureState('swiping');
        updateDebugState('swipebackMove', 'gesture');
      });

      view.on('swipebackBeforeChange', () => {
        updateDebugState('swipebackBeforeChange', 'gesture');
      });

      view.on('swipebackAfterChange', () => {
        setGestureState('completed');
        updateDebugState('swipebackAfterChange', 'gesture');
        setTimeout(() => setGestureState('idle'), 1000);
      });

      view.on('swipebackBeforeReset', () => {
        updateDebugState('swipebackBeforeReset', 'gesture');
      });

      view.on('swipebackAfterReset', () => {
        setGestureState('cancelled');
        updateDebugState('swipebackAfterReset', 'gesture');
        setTimeout(() => setGestureState('idle'), 1000);
      });

      // Router events
      view.router.on('routeChange', (newRoute) => {
        updateDebugState(`routeChange → ${newRoute?.url || '?'}`, 'router');
      });

      view.router.on('routeChanged', (newRoute) => {
        updateDebugState(`routeChanged → ${newRoute?.url || '?'}`, 'router');
      });

      // Page lifecycle events
      view.on('pageBeforeIn', (page) => {
        updateDebugState(`pageBeforeIn: ${page?.name || '?'}`, 'lifecycle');
      });

      view.on('pageAfterIn', (page) => {
        updateDebugState(`pageAfterIn: ${page?.name || '?'}`, 'lifecycle');
      });

      view.on('pageBeforeOut', (page) => {
        updateDebugState(`pageBeforeOut: ${page?.name || '?'}`, 'lifecycle');
      });

      view.on('pageAfterOut', (page) => {
        updateDebugState(`pageAfterOut: ${page?.name || '?'}`, 'lifecycle');
      });

      view.on('pageInit', (page) => {
        updateDebugState(`pageInit: ${page?.name || '?'}`, 'lifecycle');
      });

      view.on('pageBeforeRemove', (page) => {
        updateDebugState(`pageBeforeRemove: ${page?.name || '?'}`, 'lifecycle');
      });
    });

    // Listen for popstate
    const handlePopState = () => {
      updateDebugState('POPSTATE', 'browser');
    };
    window.addEventListener('popstate', handlePopState);

    // Listen for clicks on navigation elements
    const handleClick = (e) => {
      const target = e.target.closest('a, button, .ios-list-item-link, .ios-tabbar-item, .link');
      if (target) {
        const href = target.getAttribute('href') || target.closest('[href]')?.getAttribute('href');
        const text = target.textContent?.slice(0, 15) || '';
        updateDebugState(`CLICK: ${href || text || target.className.slice(0, 15)}`, 'interaction');
      }
    };
    document.addEventListener('click', handleClick, true);

    // Listen for touch near left edge (swipe detection area)
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (touch && touch.clientX < 60) {
        updateDebugState(`TOUCH edge x:${Math.round(touch.clientX)}`, 'gesture');
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    // Listen for cleanup console logs
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      const msg = args.join(' ');
      if (msg.includes('[SwipeFix]') || msg.includes('[MainViewProtection]')) {
        updateDebugState(msg.replace(/\[.*?\]\s*/, ''), 'cleanup');
      }
    };

    // Periodic refresh
    const interval = setInterval(() => updateDebugState(), 500);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleTouchStart);
      console.log = originalLog;
      clearInterval(interval);
    };
  }, []);

  const { 
    isDespia: inDespia, 
    routerTransitioning, 
    allowPageChange, 
    historyStack,
    currentUrl, 
    pageClasses, 
    hasOpacityEffect,
    eventLog,
    cleanupLog,
    gestureState,
  } = debugState;

  // Status indicators
  const isBlocked = routerTransitioning || !allowPageChange || hasOpacityEffect;

  // Gesture state colors
  const gestureColors = {
    idle: '#666',
    swiping: '#f90',
    completed: '#0f0',
    cancelled: '#f33',
  };

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          background: isBlocked ? '#f33' : '#0c0',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 99999,
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        🔍 {isBlocked ? '⛔' : '✅'} TAP
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.92)',
      color: '#fff',
      padding: '10px',
      borderRadius: '12px',
      fontSize: '9px',
      fontFamily: 'monospace',
      zIndex: 99999,
      maxWidth: '95vw',
      maxHeight: '70vh',
      overflow: 'auto',
      pointerEvents: 'auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#0af' }}>
          🔍 DEBUG
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          style={{
            background: '#333',
            border: 'none',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '9px',
            cursor: 'pointer',
          }}
        >
          minimize
        </button>
      </div>

      {/* Status Banner */}
      <div style={{
        background: isBlocked ? '#f33' : '#0c0',
        padding: '3px 6px',
        borderRadius: '4px',
        marginBottom: '6px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '10px',
      }}>
        {isBlocked ? '⛔ NAVIGATION BLOCKED' : '✅ NAVIGATION OK'}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Left Column - State */}
        <div style={{ flex: 1, minWidth: '140px' }}>
          {/* Environment */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>ENV:</span>{' '}
            <span style={{ color: inDespia ? '#0f0' : '#ff0' }}>
              {inDespia ? 'Despia' : 'Web'}
            </span>
          </div>

          {/* Gesture State */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>Gesture:</span>{' '}
            <span style={{ color: gestureColors[gestureState] }}>
              {gestureState}
            </span>
          </div>

          {/* Router State */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>trans:</span>{' '}
            <span style={{ color: routerTransitioning ? '#f33' : '#0f0' }}>
              {String(routerTransitioning)}
            </span>
            {' '}
            <span style={{ color: '#888' }}>allow:</span>{' '}
            <span style={{ color: allowPageChange ? '#0f0' : '#f33' }}>
              {String(allowPageChange)}
            </span>
          </div>

          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>opacity:</span>{' '}
            <span style={{ color: hasOpacityEffect ? '#f33' : '#0f0' }}>
              {String(hasOpacityEffect)}
            </span>
          </div>

          {/* Route Info */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>URL:</span>{' '}
            <span style={{ color: '#0af', wordBreak: 'break-all' }}>{currentUrl.slice(0, 25)}</span>
          </div>

          {/* History Stack */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ color: '#888', marginBottom: '2px' }}>History ({historyStack.length}):</div>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 4px',
              borderRadius: '2px',
              fontSize: '8px',
            }}>
              {historyStack.map((h, i) => (
                <div key={i} style={{ color: i === historyStack.length - 1 ? '#0f0' : '#666' }}>
                  {i}: {h.slice(0, 20)}
                </div>
              ))}
            </div>
          </div>

          {/* Page Classes */}
          <div>
            <div style={{ color: '#888', marginBottom: '2px' }}>Pages:</div>
            {pageClasses.map((pc, i) => (
              <div key={i} style={{ 
                color: pc.includes('transitioning') || pc.includes('swipe') ? '#f93' : 
                       pc.includes('page-current') ? '#0f0' : 
                       pc.includes('page-previous') ? '#f90' : '#aaa',
                fontSize: '8px',
              }}>
                {pc}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Logs */}
        <div style={{ flex: 1, minWidth: '140px' }}>
          {/* Event Log */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ color: '#888', marginBottom: '2px' }}>Events:</div>
            <div style={{ 
              maxHeight: '90px', 
              overflow: 'auto',
              background: 'rgba(255,255,255,0.05)',
              padding: '3px',
              borderRadius: '3px',
            }}>
              {eventLog.length === 0 ? (
                <div style={{ color: '#444' }}>No events</div>
              ) : (
                eventLog.map((event, i) => (
                  <div key={i} style={{ 
                    color: event.includes('POPSTATE') ? '#f0f' : 
                           event.includes('CLICK') ? '#0af' :
                           event.includes('TOUCH') ? '#ff0' :
                           event.includes('swipeback') ? '#f93' : 
                           event.includes('route') ? '#0f0' :
                           event.includes('page') ? '#aaa' : '#666',
                    fontSize: '8px',
                  }}>
                    {event}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cleanup Log */}
          <div>
            <div style={{ color: '#888', marginBottom: '2px' }}>Cleanup:</div>
            <div style={{ 
              maxHeight: '70px', 
              overflow: 'auto',
              background: 'rgba(255,255,255,0.05)',
              padding: '3px',
              borderRadius: '3px',
            }}>
              {cleanupLog.length === 0 ? (
                <div style={{ color: '#444' }}>No cleanup</div>
              ) : (
                cleanupLog.map((log, i) => (
                  <div key={i} style={{ 
                    color: log.includes('Removed') || log.includes('Fixed') ? '#0f0' : 
                           log.includes('Starting') ? '#0af' :
                           log.includes('complete') ? '#0f0' : '#aaa',
                    fontSize: '8px',
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
