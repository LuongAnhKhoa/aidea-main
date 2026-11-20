import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import ContactWidget from './components/ContactWidget.jsx';
import './App.css';

function App() {
  return (
    <div>
      <AppRoutes />
      <ContactWidget />
    </div>
  );
}

export default App;
