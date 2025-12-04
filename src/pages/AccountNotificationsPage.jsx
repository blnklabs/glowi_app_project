import { Page, Navbar, NavLeft, NavTitle, Link, Icon } from 'framework7-react';
import { IosListGroup, IosListItem, IosListFooterLink } from '../components/IosList';

export default function AccountNotificationsPage() {
  return (
    <Page className="ios-list-page">
      <Navbar>
        <NavLeft>
          <Link back className="flex items-center">
            <Icon f7="chevron_left" style={{ fontSize: '24px', position: 'relative', left: '-2px' }} />
          </Link>
        </NavLeft>
        <NavTitle>Notifications & Privacy</NavTitle>
      </Navbar>

      {/* Push Notifications */}
      <IosListGroup header="Push Notifications">
        <IosListItem title="Enable All Notifications" toggle toggleChecked />
        <IosListItem title="Activity Alerts" toggle toggleChecked />
        <IosListItem title="Reminders" toggle toggleChecked />
        <IosListItem title="Promotions & Offers" toggle />
      </IosListGroup>

      {/* Email Notifications */}
      <IosListGroup header="Email Notifications">
        <IosListItem title="Product Updates" toggle toggleChecked />
        <IosListItem title="Tips & Recommendations" toggle />
        <IosListItem title="Marketing Emails" toggle />
      </IosListGroup>

      {/* Notification Frequency */}
      <IosListGroup header="Notification Frequency">
        <IosListItem link="#" title="Frequency" value="Immediate" />
      </IosListGroup>

      {/* Data & Privacy */}
      <IosListGroup header="Data & Privacy">
        <IosListItem title="Store Data Locally" toggle toggleChecked />
        <IosListItem title="Share Anonymous Usage Data" toggle />
      </IosListGroup>

      {/* Data Controls */}
      <IosListGroup header="Data Controls">
        <IosListItem link="#" title="Download My Data" />
        <IosListItem link="#" title="Clear Local Cache" />
        <IosListItem
          title="Delete All My Data"
          destructive
          onClick={() => console.log('Delete all data')}
        />
      </IosListGroup>

      <IosListFooterLink onClick={() => console.log('Privacy info')}>
        See how your data is managed...
      </IosListFooterLink>
    </Page>
  );
}
