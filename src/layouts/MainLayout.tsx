import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="main-layout">
      <Header />

      <div className="layout-body">
        <Sidebar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;