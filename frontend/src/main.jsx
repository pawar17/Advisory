import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <GameProvider>
        <Toaster position="top-center" />
        <App />
      </GameProvider>
    </AuthProvider>
  </React.StrictMode>
);
