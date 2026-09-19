import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import SkipLink from "../components/common/SkipLink";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="main-layout">
      <SkipLink />
      <Header />

      <div className="layout-body">
        <Sidebar />

        <main className="main-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;