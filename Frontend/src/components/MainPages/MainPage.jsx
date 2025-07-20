import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './NormalRoute.jsx'


const MainpageRoutes = () => (

  
  <Routes>
    <Route path="/*" element={<Home />} />
    {/* Add more routes as needed */}
  </Routes>
);

export default MainpageRoutes;
