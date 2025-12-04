import { lightHaptic } from '../utils/despia.js';

export default function TabBar({ activeTab, onTabChange }) {
  // iOS system colors
  const activeColor = '#007AFF';
  const inactiveColor = '#8E8E93';

  // Handle tab change with haptic feedback
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      lightHaptic(); // Trigger haptic on tab switch (native only)
      onTabChange(tab);
    }
  };

  return (
    <div className="ios-tabbar">
      {/* Home Tab */}
      <button
        onClick={() => handleTabChange('home')}
        className="ios-tabbar-item"
      >
        <i
          className="f7-icons ios-tabbar-icon"
          style={{ color: activeTab === 'home' ? activeColor : inactiveColor }}
        >
          {activeTab === 'home' ? 'house_fill' : 'house'}
        </i>
        <span
          className="ios-tabbar-label"
          style={{ color: activeTab === 'home' ? activeColor : inactiveColor }}
        >
          Home
        </span>
      </button>

      {/* Explore Tab */}
      <button
        onClick={() => handleTabChange('explore')}
        className="ios-tabbar-item"
      >
        <i
          className="f7-icons ios-tabbar-icon"
          style={{ color: activeTab === 'explore' ? activeColor : inactiveColor }}
        >
          {activeTab === 'explore' ? 'search' : 'search'}
        </i>
        <span
          className="ios-tabbar-label"
          style={{ color: activeTab === 'explore' ? activeColor : inactiveColor }}
        >
          Explore
        </span>
      </button>
    </div>
  );
}
