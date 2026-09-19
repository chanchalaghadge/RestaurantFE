import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load components for code splitting
const Login = lazy(() => import("../components/auth/Login/Login"));
const ForgotPassword = lazy(() => import("../components/auth/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("../components/auth/ResetPassword/ResetPassword"));
const Dashboard = lazy(() => import("../components/Dashboard/Dashboard"));
const MainLayout = lazy(() => import("../layouts/MainLayout"));
const CategoryListPage = lazy(() => import("../components/Categories/pages/CategoryListPage"));
const CategoryCreatePage = lazy(() => import("../components/Categories/pages/CategoryCreatePage"));
const CategoryEditPage = lazy(() => import("../components/Categories/pages/CategoryEditPage"));
const CategoryViewPage = lazy(() => import("../components/Categories/pages/CategoryViewPage"));
const CategoryGallery = lazy(() => import("../components/Categories/pages/CategoryGallery"));
const UnderDevelopment = lazy(() => import("../components/common/UnderDevelopment/UnderDevelopment"));
const AddMenuItemPage = lazy(() => import("../components/MenuItems/pages/AddMenuItemPage"));
const MenuItemsListPage = lazy(() => import("../components/MenuItems/pages/MenuItemsListPage"));
const Landing = lazy(() => import("../components/Landing/Landing"));
const LandingMenu = lazy(() => import("../components/Landing/pages/LandingMenu"));
const LandingAbout = lazy(() => import("../components/Landing/pages/LandingAbout"));
const LandingContact = lazy(() => import("../components/Landing/pages/LandingContact"));
const CustomerListPage = lazy(() => import("../components/Customers/pages/CustomerListPage"));
const CustomerCreatePage = lazy(() => import("../components/Customers/pages/CustomerCreatePage"));
const CustomerEditPage = lazy(() => import("../components/Customers/pages/CustomerEditPage"));
const CustomerViewPage = lazy(() => import("../components/Customers/pages/CustomerViewPage"));
const OrdersPage = lazy(() => import("../components/Orders/OrdersPage"));
const TablesPage = lazy(() => import("../components/Tables/TablesPage"));
const UsersPage = lazy(() => import("../components/Users/UsersPage"));
const UserFormPage = lazy(() => import("../components/Users/UserFormPage"));

// Loading fallback for lazy-loaded components
function RouteLoadingFallback() {
  return <LoadingSpinner text="Loading..." fullScreen />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
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
          <Route path="/signup" element={<UserFormPage />} />

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
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />
            <Route path="/reports" element={<UnderDevelopment />} />
            <Route path="/settings" element={<UnderDevelopment />} />

          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
