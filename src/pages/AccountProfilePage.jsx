import { Page, Navbar, NavLeft, NavTitle, Link } from 'framework7-react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { IosListGroup, IosListItem, IosListItemInput } from '../components/IosList';

export default function AccountProfilePage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <Link back className="flex items-center">
            <ChevronLeftIcon className="w-6 h-6 text-black" />
          </Link>
        </NavLeft>
        <NavTitle>Profile & Security</NavTitle>
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

      {/* Security Section */}
      <IosListGroup header="Security">
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
