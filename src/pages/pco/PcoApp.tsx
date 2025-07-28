import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePcoAuthStore } from '../../stores/pcoAuthStore';
import { PCOLayout } from './PCOLayout';
import PcoDashboard from './PcoDashboard';

const PcoApp: React.FC = () => {
  const { isAuthenticated, pcoUser } = usePcoAuthStore();

  // If not authenticated or user is not a PCO, redirect to login
  if (!isAuthenticated || !pcoUser || pcoUser.role !== 'pco') {
    return <Navigate to="/login" replace />;
  }

  return (
    <PCOLayout>
      <Routes>
        <Route path="/" element={<PcoDashboard />} />
        <Route path="/dashboard" element={<PcoDashboard />} />
        <Route path="*" element={<Navigate to="/pco/dashboard" replace />} />
      </Routes>
    </PCOLayout>
  );
};

export default PcoApp;
