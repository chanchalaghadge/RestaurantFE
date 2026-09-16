import {
  BrowserRouter,
  Routes,
  Route,
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
import AddMenuItemPage from "../components/MenuItems/pages/AddMenuItemPage.tsx";
import MenuItemsListPage from "../components/MenuItems/pages/MenuItemsListPage";
import Landing from "../components/Landing/Landing";
import LandingMenu from "../components/Landing/pages/LandingMenu";
import LandingAbout from "../components/Landing/pages/LandingAbout";
import LandingContact from "../components/Landing/pages/LandingContact";
import CustomerListPage from "../components/Customers/pages/CustomerListPage";
import CustomerCreatePage from "../components/Customers/pages/CustomerCreatePage";
import CustomerEditPage from "../components/Customers/pages/CustomerEditPage";
import CustomerViewPage from "../components/Customers/pages/CustomerViewPage";
import OrdersPage from "../components/Orders/OrdersPage";
import TablesPage from "../components/Tables/TablesPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Landing />} />
        <Route path="/public-menu" element={<LandingMenu />} />
        <Route path="/about" element={<LandingAbout />} />
        <Route path="/contact" element={<LandingContact />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<UnderDevelopment />} />

        {/* Main application layout */}
        <Route element={<MainLayout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/categories/new" element={<CategoryCreatePage />} />
          <Route path="/categories/gallery" element={<CategoryGallery />} />
          <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
          <Route path="/categories/:id" element={<CategoryViewPage />} />
          <Route path="/menu" element={<MenuItemsListPage />} />
          <Route path="/menu/add" element={<AddMenuItemPage />} />
          <Route path="/menu/:id/edit" element={<AddMenuItemPage />} />
          <Route path="/ingredients" element={<UnderDevelopment />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/reservations" element={<TablesPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/new" element={<CustomerCreatePage />} />
          <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
          <Route path="/customers/:id" element={<CustomerViewPage />} />
          <Route path="/reports" element={<UnderDevelopment />} />
          <Route path="/settings" element={<UnderDevelopment />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
