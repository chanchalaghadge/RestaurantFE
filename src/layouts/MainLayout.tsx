import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import SkipLink from "../components/common/SkipLink";
import "./MainLayout.css";

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("restaurant-user") || "{}");
  const role = user.role as string | undefined;

  useEffect(() => {
    if (role === "Chef" && location.pathname !== "/kitchen") navigate("/kitchen", { replace: true });
    else if (role === "Waiter" || role === "Captain") {
      const orderOrCustomerPage = ["/orders", "/tables", "/customers"].some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
      const menuReadPage = location.pathname === "/menu" || /^\/menu\/\d+$/.test(location.pathname);
      if (!orderOrCustomerPage && !menuReadPage) navigate("/orders", { replace: true });
    }
  }, [location.pathname, navigate, role]);

  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  return (
    <div className="main-layout">
      <SkipLink />
      <Header isMenuOpen={mobileNavOpen} onMenuToggle={() => setMobileNavOpen((open) => !open)} />

      <div className="layout-body">
        <Sidebar isOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
        {mobileNavOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)} />}

        <main className="main-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
