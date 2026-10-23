import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/dashboardlayout";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import { useAuth } from "../context/AuthContext";

// Lazy-loaded page components
const Dashboard = lazy(() => import("../pages/dashboard/dashboard"));
const Sales = lazy(() => import("../pages/sales/Sales"));
const Purchases = lazy(() => import("../pages/purchases/purchases"));
const Inventory = lazy(() => import("../pages/inventory/Inventory"));
const Customers = lazy(() => import("../pages/customers/Customers"));
const Suppliers = lazy(() => import("../pages/suppliers/Suppliers"));
const Employees = lazy(() => import("../pages/employees/Employees"));
const Accounting = lazy(() => import("../pages/accounting/Accounting"));
const Reports = lazy(() => import("../pages/reports/Reports"));
const Settings = lazy(() => import("../pages/settings/Settings"));

function RouteSpinner() {
  return (
    <div className="route-spinner-container">
      <div className="route-spinner" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <RouteSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteSpinner />}>
      <Routes>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ERP Dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Any unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
