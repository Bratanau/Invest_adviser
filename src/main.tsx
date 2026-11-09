import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

const telegramWebApp = window.Telegram?.WebApp;
telegramWebApp?.ready();
telegramWebApp?.expand();

createRoot(document.getElementById('root')!).render(<App />);
