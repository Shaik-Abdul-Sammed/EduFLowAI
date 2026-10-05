const originalError = console.error;
console.error = (...args) => {
  const msg = String(args[0] || '');
  if (msg.includes('chrome-extension://')) return;
  if (msg.includes('installHook.js')) return;
  if (msg.includes('Auth error detail')) return;
  originalError(...args);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
