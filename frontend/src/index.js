// ============================================
// React Entry Point (index.js)
// ============================================
// This is the first JavaScript file that runs.
// It renders the <App /> component into the
// HTML page's <div id="root"> element.
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import "tailwindcss";

// Create a React root and render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
