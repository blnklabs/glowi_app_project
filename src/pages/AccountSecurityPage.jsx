import { Page, Navbar, NavLeft, NavTitle, Link } from 'framework7-react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { IosListGroup, IosListItem } from '../components/IosList';

export default function AccountSecurityPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <Link back className="flex items-center">
            <ChevronLeftIcon className="w-6 h-6 text-black" />
          </Link>
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
