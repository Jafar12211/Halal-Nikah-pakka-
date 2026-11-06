import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for offline support and Android installation
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
