import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../components/auth/Login/Login";
import Dashboard from "../components/Dashboard/Dashboard";
import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Main application layout */}
        <Route element={<MainLayout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;