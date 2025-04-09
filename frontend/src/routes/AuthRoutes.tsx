import React from 'react';
import {Routes, Route} from 'react-router-dom';
import LoginPage from 'src/pages/auth/LoginPage';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default AuthRoutes;
