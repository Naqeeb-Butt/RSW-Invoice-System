import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import logger from './utils/logger';
import { createApiLogger } from './utils/logger';
import axios from 'axios';

// Setup API logging
createApiLogger(axios);

// Log application start
logger.info('Aasko Invoice System Frontend starting...', {
  version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Global JavaScript Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    stack: event.reason?.stack
  });
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
