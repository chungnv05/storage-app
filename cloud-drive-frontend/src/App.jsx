import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// import Navbar from './components/Navbar';
import Home from './pages/Home';
// import Dashboard from './pages/Dashboard';
// import ChangePassword from './pages/ChangePassword';

import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}

      <Routes>
        
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;