import MainView from './pages/MainView.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AccountSecurityPage from './pages/AccountSecurityPage.jsx';
import AccountPreferencesPage from './pages/AccountPreferencesPage.jsx';
import AccountNotificationsPage from './pages/AccountNotificationsPage.jsx';
import AccountAboutPage from './pages/AccountAboutPage.jsx';

const routes = [
  { path: '/', component: MainView },
  { path: '/account/', component: AccountPage },
  { path: '/account/security/', component: AccountSecurityPage },
  { path: '/account/preferences/', component: AccountPreferencesPage },
  { path: '/account/notifications/', component: AccountNotificationsPage },
  { path: '/account/about/', component: AccountAboutPage },
];

export default routes;
