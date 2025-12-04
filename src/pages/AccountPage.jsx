import { Page, Navbar, NavLeft, NavTitle, Link } from 'framework7-react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { IosListGroup, IosListItem, IosListItemInput } from '../components/IosList';

export default function AccountPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <Link back className="flex items-center">
            <ChevronLeftIcon className="w-6 h-6 text-black" />
          </Link>
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
