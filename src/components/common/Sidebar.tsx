import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <h2>Restaurant</h2>
      </div>

      <nav className="sidebar-menu">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/tables">Tables</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/payments">Payments</Link>
        <Link to="/reports">Reports</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;