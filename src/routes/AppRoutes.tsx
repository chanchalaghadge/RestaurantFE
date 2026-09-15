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
import CategoryListPage from "../components/Categories/pages/CategoryListPage";
import CategoryCreatePage from "../components/Categories/pages/CategoryCreatePage";
import CategoryEditPage from "../components/Categories/pages/CategoryEditPage";
import CategoryViewPage from "../components/Categories/pages/CategoryViewPage";
import CategoryGallery from "../components/Categories/pages/CategoryGallery";
import UnderDevelopment from "../components/common/UnderDevelopment/UnderDevelopment";
import AddMenuItemPage from "../components/MenuItems/pages/AddMenuItemPage";

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
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/categories/new" element={<CategoryCreatePage />} />
          <Route path="/categories/gallery" element={<CategoryGallery />} />
          <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
          <Route path="/categories/:id" element={<CategoryViewPage />} />
          <Route path="/menu" element={<UnderDevelopment />} />
          <Route path="/menu/add" element={<AddMenuItemPage />} />
          <Route path="/ingredients" element={<UnderDevelopment />} />
          <Route path="/orders" element={<UnderDevelopment />} />
          <Route path="/reservations" element={<UnderDevelopment />} />
          <Route path="/customers" element={<UnderDevelopment />} />
          <Route path="/reports" element={<UnderDevelopment />} />
          <Route path="/settings" element={<UnderDevelopment />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;