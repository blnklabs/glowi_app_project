import ReactDOM from 'react-dom/client';
import MyApp from './App.jsx';
import 'framework7-icons/css/framework7-icons.css';
import './styles/index.css';
import { initSafeAreas } from './utils/despia.js';

// Initialize Despia safe area CSS variables (fail-safe)
// When running in Despia runtime, these are auto-injected
// For web, this sets fallbacks using env() values
try {
  initSafeAreas();
} catch (e) {
  console.warn('[Despia] Safe area init failed:', e);
}

// Note: StrictMode removed for Framework7 compatibility
// F7 components like Range double-initialize in StrictMode
ReactDOM.createRoot(document.getElementById('root')).render(<MyApp />);
