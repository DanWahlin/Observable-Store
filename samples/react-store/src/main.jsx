import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ObservableStore } from '@codewithdan/observable-store';

const production = import.meta.env.PROD;
ObservableStore.globalSettings = { isProduction: production };

createRoot(document.getElementById('root')).render(<App />);
