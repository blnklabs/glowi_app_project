import MainView from './pages/MainView.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AccountProfilePage from './pages/AccountProfilePage.jsx';
import AccountPreferencesPage from './pages/AccountPreferencesPage.jsx';
import AccountNotificationsPage from './pages/AccountNotificationsPage.jsx';
import AccountAboutPage from './pages/AccountAboutPage.jsx';

const routes = [
  { path: '/', component: MainView },
  { path: '/account/', component: AccountPage },
  { path: '/account/profile/', component: AccountProfilePage },
  { path: '/account/preferences/', component: AccountPreferencesPage },
  { path: '/account/notifications/', component: AccountNotificationsPage },
  { path: '/account/about/', component: AccountAboutPage },
];

export default routes;
