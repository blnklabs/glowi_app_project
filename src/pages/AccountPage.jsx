import { Page, Navbar, NavLeft, NavTitle, Link } from 'framework7-react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { IosListGroup, IosListItem } from '../components/IosList';

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

      <IosListGroup>
        <IosListItem
          link="/account/profile/"
          title="Profile & Security"
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
