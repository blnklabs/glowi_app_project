import { Page, Navbar, Tabs, Tab, NavRight, Link } from 'framework7-react';
import { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import TabBar from '../components/TabBar';
import { lightHaptic } from '../utils/despia.js';

export default function MainView() {
  const [activeTab, setActiveTab] = useState('home');
  const [titleKey, setTitleKey] = useState(0);

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
        </Tab>
        <Tab id="tab-explore" tabActive={activeTab === 'explore'} className="page-content tab-fade">
        </Tab>
      </Tabs>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </Page>
  );
}
