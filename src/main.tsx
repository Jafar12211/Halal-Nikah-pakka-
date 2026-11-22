import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the PWA service worker only in production builds.
// Vite exposes build mode through import.meta.env; process.env is not
// available in the browser by default and can crash startup with
// "process is not defined" before React mounts, producing a blank page.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
