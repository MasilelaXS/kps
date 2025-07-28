

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { isMobileDevice } from './utils/deviceDetection';
import LoginPage from './pages/LoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import PcoApp from './pages/pco/PcoApp';

function App() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const isMobile = isMobileDevice();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Mobile devices go directly to PCO app */}
          {isMobile ? (
            <>
              <Route path="/pco/*" element={<PcoApp />} />
              <Route path="*" element={<Navigate to="/pco" replace />} />
            </>
          ) : (
            <>
              {/* Desktop routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes for desktop */}
              {isAuthenticated && user ? (
                <>
                  <Route path="/admin/*" element={user.role === 'admin' ? <AdminLayout /> : <Navigate to="/pco" />} />
                  <Route path="/pco/*" element={user.role === 'pco' ? <PcoApp /> : <Navigate to="/admin" />} />
                  
                  {/* Default redirect based on role */}
                  <Route path="/" element={
                    <Navigate to={user.role === 'admin' ? '/admin' : '/pco'} replace />
                  } />
                </>
              ) : (
                <>
                  {/* Redirect unauthenticated users to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              )}
            </>
          )}
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
    </>
  );
}

export default App;
