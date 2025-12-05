import { Page, Navbar, NavLeft, NavTitle, BlockTitle, Block, Range } from 'framework7-react';
import { IosListGroup, IosListItem } from '../components/IosList';
import { useTheme } from '../context/ThemeContext';
import HapticBackLink from '../components/HapticBackLink';

export default function AccountPreferencesPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <HapticBackLink />
        </NavLeft>
        <NavTitle>Preferences</NavTitle>
      </Navbar>

      {/* Display Section */}
      <IosListGroup header="Display">
        <IosListItem
          title="Dark Mode"
          toggle
          toggleChecked={isDarkMode}
          onToggleChange={toggleDarkMode}
        />
        <IosListItem title="Reduce Motion" toggle />
        <IosListItem link="#" title="Language" value="English" />
      </IosListGroup>

      {/* Behavior Section */}
      <IosListGroup header="Behavior">
        <IosListItem title="Haptic Feedback" toggle toggleChecked />
        <IosListItem title="Sound Effects" toggle />
      </IosListGroup>

      {/* Text Size Section */}
      <BlockTitle>Text Size</BlockTitle>
      <Block strong inset className="flex items-center gap-3 rounded-[10px] mx-4">
        <span className="text-sm">Small</span>
        <Range
          className="flex-1"
          min={12}
          max={24}
          step={1}
          value={16}
          label={true}
        />
        <span className="text-sm">Large</span>
      </Block>

      {/* Personalization Section */}
      <IosListGroup header="Personalization">
        <IosListItem link="#" title="Default Tab" value="Home" />
        <IosListItem link="#" title="Units" value="Imperial" />
      </IosListGroup>
    </Page>
  );
}
