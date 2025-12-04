import ReactDOM from 'react-dom/client';
import MyApp from './App.jsx';
import './styles/index.css';
import { initSafeAreas } from './utils/despia.js';

// Initialize Despia safe area CSS variables
// When running in Despia runtime, these are auto-injected
// For web, this sets fallbacks using env() values
initSafeAreas();

// Note: StrictMode removed for Framework7 compatibility
// F7 components like Range double-initialize in StrictMode
ReactDOM.createRoot(document.getElementById('root')).render(<MyApp />);
