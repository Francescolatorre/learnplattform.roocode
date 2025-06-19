import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@context/auth/AuthContext';
import { AuthInterceptorProvider } from '@context/auth/AuthInterceptorProvider';

import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AuthInterceptorProvider>
          <App />
        </AuthInterceptorProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
