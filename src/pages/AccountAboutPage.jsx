import { Page, Navbar, NavLeft, NavTitle } from 'framework7-react';
import { IosListGroup, IosListItem } from '../components/IosList';
import HapticBackLink from '../components/HapticBackLink';

export default function AccountAboutPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <HapticBackLink />
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
