import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/Members/MembersList';
import LeadsList from './pages/Leads/LeadsList';
import AttendanceLog from './pages/Attendance/AttendanceLog';
import PaymentsLedger from './pages/Payments/PaymentsLedger';
import AdminGyms from './pages/Admin/AdminGyms';
import Reports from './pages/Reports/Reports';
import { LogOut } from 'lucide-react';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />; // Fallback to dashboard if insufficient role
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold text-blue-600">GYMOS</span>
              
              <div className="hidden md:flex space-x-4">
                {user.role === 'SUPER_ADMIN' ? (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Platform Admin</Link>
                ) : (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                    <Link to="/members" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Members</Link>
                    <Link to="/leads" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Leads</Link>
                    <Link to="/attendance" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Attendance</Link>
                    <Link to="/payments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Ledger</Link>
                    <Link to="/reports" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Reports</Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 text-xs bg-gray-100 rounded-full font-semibold border border-gray-200">{user.role}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button onClick={logout} className="text-gray-500 hover:text-red-600 p-2">
      <LogOut className="h-5 w-5" />
    </button>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><LeadsList /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendanceLog /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsLedger /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      
      {/* Platform Admin Route */}
      <Route path="/admin" element={<ProtectedRoute requireRole="SUPER_ADMIN"><AdminGyms /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}