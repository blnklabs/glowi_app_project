import { Page, Navbar, NavLeft, NavTitle, Link, Icon } from 'framework7-react';
import { IosListGroup, IosListItem } from '../components/IosList';

export default function AccountAboutPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <Link back className="flex items-center">
            <Icon f7="chevron_left" style={{ fontSize: '24px', position: 'relative', left: '-2px' }} />
          </Link>
        </NavLeft>
        <NavTitle>About & Support</NavTitle>
      </Navbar>

      {/* Support */}
      <IosListGroup header="Support">
        <IosListItem link="#" title="Help Center / FAQ" />
        <IosListItem link="#" title="Contact Support" />
        <IosListItem link="#" title="Report a Problem" />
        <IosListItem link="#" title="Rate This App" />
      </IosListGroup>

      {/* App Info & Legal */}
      <IosListGroup header="App Info & Legal">
        <IosListItem title="Version" value="1.0.0 (42)" />
        <IosListItem link="#" title="Privacy Policy" />
        <IosListItem link="#" title="Terms of Service" />
        <IosListItem link="#" title="Open Source Licenses" />
      </IosListGroup>
    </Page>
  );
}
