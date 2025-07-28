import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { UsersPage } from './UsersPage';
import { ClientsPage } from './ClientsPage';
import { ChemicalsPage } from './ChemicalsPage';
import { ReportsPage } from './ReportsPage';
import { ReportEdit } from './ReportEdit';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/chemicals" element={<ChemicalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportId/edit" element={<ReportEdit />} />
            <Route path="/settings" element={<div className="w-full h-full flex items-center justify-center p-6">Settings Page Coming Soon</div>} />
            {/* Redirect any unknown admin routes to dashboard */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
