import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// /admin 은 판매자 페이지 (손님 페이지 번들에는 포함되지 않게 따로 불러옵니다)
const Admin = lazy(() => import('./admin/Admin.jsx'));
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}><Admin /></Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
