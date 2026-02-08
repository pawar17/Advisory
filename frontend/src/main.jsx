import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import App from './App';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <Toaster position="top-center" />
          <App />
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
