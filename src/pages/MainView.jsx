import { Page, Navbar, Tabs, Tab, NavRight, Link } from 'framework7-react';
import { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import TabBar from '../components/TabBar';
import { lightHaptic, isDespia } from '../utils/despia.js';

export default function MainView() {
  const [activeTab, setActiveTab] = useState('home');
  const [titleKey, setTitleKey] = useState(0);
  const [safeAreaDebug, setSafeAreaDebug] = useState({
    source: 'Loading...',
    top: '...',
    bottom: '...',
    f7Top: '...',
    f7Bottom: '...',
    envTop: '...',
    envBottom: '...',
    cssVarTop: '...',
    cssVarBottom: '...',
  });

  useEffect(() => {
    const computeStyles = getComputedStyle(document.documentElement);

    // Get CSS custom property values
    const cssVarTop = computeStyles.getPropertyValue('--safe-area-top').trim() || 'not set';
    const cssVarBottom = computeStyles.getPropertyValue('--safe-area-bottom').trim() || 'not set';

    // Get F7 safe area variables
    const f7Top = computeStyles.getPropertyValue('--f7-safe-area-top').trim() || 'not set';
    const f7Bottom = computeStyles.getPropertyValue('--f7-safe-area-bottom').trim() || 'not set';

    // Try to get env() values by creating a test element
    const testEl = document.createElement('div');
    testEl.style.paddingTop = 'env(safe-area-inset-top, 0px)';
    testEl.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    document.body.appendChild(testEl);
    const testStyles = getComputedStyle(testEl);
    const envTop = testStyles.paddingTop;
    const envBottom = testStyles.paddingBottom;
    document.body.removeChild(testEl);

    // Determine source
    const inDespia = isDespia();
    let source = 'Web (env() fallback)';
    if (inDespia) {
      source = 'Despia Native Runtime';
    }

    setSafeAreaDebug({
      source,
      top: cssVarTop,
      bottom: cssVarBottom,
      f7Top,
      f7Bottom,
      envTop,
      envBottom,
      cssVarTop,
      cssVarBottom,
    });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTitleKey(prev => prev + 1);
  };

  // Handle button press with haptic feedback
  const handleButtonPress = () => {
    lightHaptic(); // Trigger haptic on button press (native only)
    // Add your button action here
  };

  return (
    <Page pageContent={false} className="main-view-page">
      <Navbar large title={activeTab === 'home' ? 'Home' : 'Explore'} titleLargeKey={titleKey}>
        <NavRight>
          <Link href="/account/" iconOnly>
            <UserCircleIcon className="w-6 h-6 text-black" />
          </Link>
        </NavRight>
      </Navbar>

      <Tabs>
        <Tab id="tab-home" tabActive={activeTab === 'home'} className="page-content tab-fade">
          {/* Primary CTA Button - iOS style with haptic feedback */}
          <div className="px-5 mt-8">
            <button className="ios-button" onClick={handleButtonPress}>
              Next
            </button>
          </div>

          {/* Safe Area Debug Console */}
          <div className="flex items-center justify-center" style={{ marginTop: '40px' }}>
            <div
              style={{
                backgroundColor: '#1a1a1a',
                color: '#00ff00',
                fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                fontSize: '12px',
                padding: '16px',
                borderRadius: '12px',
                width: 'calc(100% - 40px)',
                maxWidth: '340px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ color: '#888', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Safe Area Debug Console
              </div>
              <div style={{ borderBottom: '1px solid #333', marginBottom: '8px', paddingBottom: '8px' }}>
                <span style={{ color: '#ff9500' }}>Source:</span> {safeAreaDebug.source}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#5ac8fa' }}>--safe-area-top:</span> {safeAreaDebug.cssVarTop}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#5ac8fa' }}>--safe-area-bottom:</span> {safeAreaDebug.cssVarBottom}
              </div>
              <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#af52de' }}>--f7-safe-area-top:</span> {safeAreaDebug.f7Top}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#af52de' }}>--f7-safe-area-bottom:</span> {safeAreaDebug.f7Bottom}
              </div>
              <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#32d74b' }}>env() top (computed):</span> {safeAreaDebug.envTop}
              </div>
              <div>
                <span style={{ color: '#32d74b' }}>env() bottom (computed):</span> {safeAreaDebug.envBottom}
              </div>
            </div>
          </div>
        </Tab>
        <Tab id="tab-explore" tabActive={activeTab === 'explore'} className="page-content tab-fade">
        </Tab>
      </Tabs>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </Page>
  );
}
