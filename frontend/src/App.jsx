import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Landing & Auth
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

// Layout
import DashboardLayout from './components/DashboardLayout';

// ERP Pages
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import CreateRFQ from './pages/CreateRFQ';
import Quotations from './pages/Quotations';
import QuotationComparison from './pages/QuotationComparison';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';

import Cursor from './components/Cursor';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Cursor />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected ERP Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendors" element={<RoleRoute allowed={['admin', 'procurement_officer']}><Vendors /></RoleRoute>} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/rfqs/new" element={<RoleRoute allowed={['procurement_officer']}><CreateRFQ /></RoleRoute>} />
            <Route path="/quotations" element={<RoleRoute allowed={['vendor', 'procurement_officer']}><Quotations /></RoleRoute>} />
            <Route path="/quotations/compare/:rfqId" element={<RoleRoute allowed={['procurement_officer']}><QuotationComparison /></RoleRoute>} />
            <Route path="/approvals" element={<RoleRoute allowed={['manager']}><Approvals /></RoleRoute>} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reports" element={<RoleRoute allowed={['admin', 'procurement_officer', 'manager']}><Reports /></RoleRoute>} />
            <Route path="/activity" element={<RoleRoute allowed={['admin', 'procurement_officer', 'manager']}><ActivityLogs /></RoleRoute>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
