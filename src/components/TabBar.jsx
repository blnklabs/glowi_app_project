import {
  HomeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';
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
        {activeTab === 'home' ? (
          <HomeIconSolid
            className="ios-tabbar-icon"
            style={{ color: activeColor }}
          />
        ) : (
          <HomeIcon
            className="ios-tabbar-icon"
            style={{ color: inactiveColor }}
          />
        )}
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
        {activeTab === 'explore' ? (
          <MagnifyingGlassIconSolid
            className="ios-tabbar-icon"
            style={{ color: activeColor }}
          />
        ) : (
          <MagnifyingGlassIcon
            className="ios-tabbar-icon"
            style={{ color: inactiveColor }}
          />
        )}
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
