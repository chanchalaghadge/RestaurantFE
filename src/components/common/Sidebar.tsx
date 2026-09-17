import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);

  const handleMenuToggle = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMenuOpen((current) => !current);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <div className="brand-mark">♨</div><div><h2>Foodie</h2><small>Restaurant Admin</small></div>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard">⌂ <span>Dashboard</span></NavLink>
        <div className={`menu-group ${menuOpen ? "open" : "closed"}`}>
          <NavLink to="/categories" onClick={handleMenuToggle}>
            ▣ <span>Menu</span><b className="menu-caret">⌃</b>
          </NavLink>
          {menuOpen && (
            <div className="submenu">
              <NavLink to="/menu">All Items</NavLink>
              <NavLink to="/categories">Categories</NavLink>
              <NavLink to="/menu/add">Add Menu Item</NavLink>
            </div>
          )}
        </div>
        <NavLink to="/orders">▤ <span>Orders</span><i>3</i></NavLink>
        <NavLink to="/tables">▦ <span>Tables</span></NavLink>
        <NavLink to="/customers">♟ <span>Customers</span></NavLink>
        <NavLink to="/users">♙ <span>Users</span></NavLink>
      </nav>
      <div className="sidebar-promo"><div className="promo-image" /><strong>Good Food<br />Happy Customers</strong><p>Manage your menu categories to make it easy for customers to find their favorite dishes.</p><em /></div>
    </aside>
  );
}

export default Sidebar;
