import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup';
import AssetDirectory from './pages/AssetDirectory';
import AllocationTransfer from './pages/AllocationTransfer';
import ResourceBooking from './pages/ResourceBooking';
import Maintenance from './pages/Maintenance';
import Audit from './pages/Audit';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/employee-dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organization" element={<OrganizationSetup />} />
          <Route path="/assets" element={<AssetDirectory />} />
          <Route path="/allocations" element={<AllocationTransfer />} />
          <Route path="/bookings" element={<ResourceBooking />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  );
}
