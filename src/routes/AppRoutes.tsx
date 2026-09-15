import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../components/auth/Login/Login";
import ForgotPassword from "../components/auth/ForgotPassword/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword/ResetPassword";
import Dashboard from "../components/Dashboard/Dashboard";
import MainLayout from "../layouts/MainLayout";
import Categories from "../components/Categories/Categories";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main application layout */}
        <Route element={<MainLayout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;