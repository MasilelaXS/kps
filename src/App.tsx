
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { SimplifiedLogin } from './components/SimplifiedLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { MobileLayout } from './components/layout/MobileLayout';
import { MobileReportLayout } from './components/layout/MobileReportLayout';
import { Dashboard } from './pages/mobile/dashboard/Dashboard';
import { ClientList } from './pages/mobile/schedule/ClientList';
import { ClientDetails } from './pages/mobile/schedule/ClientDetails';
import { Profile } from './pages/mobile/profile/Profile';
import { ReportCreation } from './pages/mobile/reports/ReportCreation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { InstallPrompt } from './components/common/InstallPrompt';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'pco') {
      return <Navigate to="/mobile/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'pco') {
    return <Navigate to="/mobile/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  const { isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen label="Initializing application..." />;
  }

  return (
    <ErrorBoundary>
      <div>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<SimplifiedLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          } />
          
          {/* Mobile PCO Routes */}
          <Route path="/mobile/*" element={
            <ProtectedRoute requiredRole="pco">
              <Routes>
                {/* Routes with bottom navigation */}
                <Route path="/*" element={
                  <MobileLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="schedule" element={<ClientList />} />
                      <Route path="schedule/:clientId" element={<ClientDetails />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="profile/change-password" element={<div className="p-4">Change Password - Coming Soon</div>} />
                      <Route path="profile/settings" element={<div className="p-4">Settings - Coming Soon</div>} />
                      <Route path="reports" element={<div className="p-4">Reports List - Coming Soon</div>} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </MobileLayout>
                } />
                
                {/* Report creation routes without bottom navigation - using URL parameters */}
                <Route path="reports/new" element={
                  <MobileReportLayout>
                    <ReportCreation />
                  </MobileReportLayout>
                } />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
      </div>
    </ErrorBoundary>
  );
}

export default App;
