import { Page, Navbar, NavLeft, NavTitle } from 'framework7-react';
import { IosListGroup, IosListItem } from '../components/IosList';
import HapticBackLink from '../components/HapticBackLink';

export default function AccountSecurityPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <HapticBackLink />
        </NavLeft>
        <NavTitle>Security</NavTitle>
      </Navbar>

      {/* Security Section */}
      <IosListGroup>
        <IosListItem link="#" title="Change Password" />
        <IosListItem link="#" title="Sign-in Methods" value="Coming soon" />
      </IosListGroup>

      {/* Danger Zone */}
      <IosListGroup header="Danger Zone">
        <IosListItem
          title="Delete Account"
          destructive
          onClick={() => console.log('Delete account')}
        />
      </IosListGroup>
    </Page>
  );
}
