import { Page, Navbar, NavLeft, NavTitle, Link, Icon } from 'framework7-react';
import { IosListGroup, IosListItem } from '../components/IosList';

export default function AccountSecurityPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <Link back className="flex items-center">
            <Icon f7="chevron_left" style={{ fontSize: '24px', position: 'relative', left: '-2px' }} />
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
