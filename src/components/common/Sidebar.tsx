import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <div className="brand-mark">♨</div><div><h2>Foodie</h2><small>Restaurant Admin</small></div>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard">⌂ <span>Dashboard</span></NavLink><div className="menu-group"><NavLink to="/categories">▣ <span>Menu</span><b>⌃</b></NavLink><div className="submenu"><NavLink to="/menu">All Items</NavLink><NavLink to="/categories">Categories</NavLink><NavLink to="/menu/add">Add Menu Item</NavLink><NavLink to="/ingredients">Ingredients</NavLink></div></div><NavLink to="/orders">▤ <span>Orders</span><i>3</i></NavLink><NavLink to="/reservations">▦ <span>Reservations</span></NavLink><NavLink to="/customers">♟ <span>Customers</span></NavLink><NavLink to="/reports">▥ <span>Reports</span></NavLink><NavLink to="/settings">⚙ <span>Settings</span></NavLink>
      </nav>
      <div className="sidebar-promo"><div className="promo-image" /><strong>Good Food<br />Happy Customers</strong><p>Manage your menu categories to make it easy for customers to find their favorite dishes.</p><em /></div>
    </aside>
  );
}

export default Sidebar;