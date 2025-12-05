import { Page, Navbar, NavLeft, NavTitle } from 'framework7-react';
import { IosListGroup, IosListItem, IosListItemInput } from '../components/IosList';
import HapticBackLink from '../components/HapticBackLink';

export default function AccountPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <HapticBackLink />
        </NavLeft>
        <NavTitle>Account</NavTitle>
      </Navbar>

      {/* Profile Section */}
      <IosListGroup header="Profile">
        <IosListItemInput
          label="Full Name"
          placeholder="Enter your name"
        />
        <IosListItemInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          readonly
        />
        <IosListItemInput
          label="Phone"
          type="tel"
          placeholder="(555) 555-5555"
        />
      </IosListGroup>

      <IosListGroup>
        <IosListItem
          link="/account/security/"
          title="Security"
        />
        <IosListItem
          link="/account/preferences/"
          title="Preferences"
        />
        <IosListItem
          link="/account/notifications/"
          title="Notifications & Privacy"
        />
        <IosListItem
          link="/account/about/"
          title="About & Support"
        />
      </IosListGroup>

      <IosListGroup>
        <IosListItem
          title="Log Out"
          destructive
          onClick={() => console.log('Log out')}
        />
      </IosListGroup>
    </Page>
  );
}
