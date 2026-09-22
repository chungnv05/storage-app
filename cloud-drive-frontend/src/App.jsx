import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StorageProvider } from './context/StorageContext.jsx';
import AppRoutes from './routes/index.jsx';

function App() {
  return (
    <StorageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StorageProvider>
  );
}

export default App;