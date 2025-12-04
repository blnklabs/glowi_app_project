import Framework7 from 'framework7/lite-bundle';
import Framework7React, { App, View } from 'framework7-react';
import routes from './routes.js';
import { ThemeProvider } from './context/ThemeContext';

Framework7.use(Framework7React);

const f7params = {
  name: 'Starter App',
  theme: 'ios',
  routes: routes,
  view: {
    iosDynamicNavbar: true,
    animate: true,
  },
};

export default function MyApp() {
  return (
    <ThemeProvider>
      <App {...f7params}>
        <View
          main
          url="/"
          iosSwipeBack={true}
          browserHistory={false}
        />
      </App>
    </ThemeProvider>
  );
}
