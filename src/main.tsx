import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class StartupErrorBoundary extends Component<PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Nikah Pakka application render failure:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc', color: '#172554', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 440, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Nikah Pakka is temporarily unavailable</h1>
            <p style={{ lineHeight: 1.6 }}>The page encountered an unexpected error. Your account data has not been deleted. Please reload the page or try again shortly.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 12, borderRadius: 8, padding: '12px 20px', background: '#065f46', color: '#fff', fontWeight: 600 }}>Reload website</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Nikah Pakka root element #root was not found.');
}

// Vite exposes the production flag through import.meta.env, not process.env.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA service worker registration failed:', err);
    });
  });
}

createRoot(rootElement).render(
  <StartupErrorBoundary>
    <App />
  </StartupErrorBoundary>,
);
