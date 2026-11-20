import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import AiTools from '../pages/AiTools';
import Projects from '../pages/Projects';
import ContactUs from '../pages/ContactUs';
import PricingPage from '../pages/PricingPage';
import ComingSoon from '../pages/ComingSoon';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/ai-tools" element={<AiTools />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}