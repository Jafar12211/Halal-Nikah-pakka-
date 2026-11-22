import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the PWA service worker only in production builds.
// Vite exposes build mode through import.meta.env; avoid reading process.env
// in browser startup code, where the process global may not exist.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
