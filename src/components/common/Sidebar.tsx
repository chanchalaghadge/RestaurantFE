import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();
  const menuIsActive = location.pathname.startsWith("/menu");

  const handleMenuToggle = () => {
    setMenuOpen((current) => !current);
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-title">
        <div className="brand-mark" aria-hidden="true">👨‍🍳</div>
        <div>
          <h2>Foodie</h2>
          <small>Restaurant Admin</small>
        </div>
      </div>

      <div className="sidebar-scroll-area">
        <nav className="sidebar-menu" aria-label="Main navigation">
          <NavLink to="/dashboard" aria-label="Go to Dashboard">
            ⌂ <span>Dashboard</span>
          </NavLink>
          <div className={`menu-group ${menuOpen ? "open" : "closed"}`}>
            <button
              type="button"
              className={`menu-toggle${menuIsActive ? " active" : ""}`}
              onClick={handleMenuToggle}
              aria-expanded={menuOpen}
              aria-controls="menu-submenu"
            >
              ▣ <span>Menu</span>
              <b className="menu-caret" aria-hidden="true">⌃</b>
            </button>
            {menuOpen && (
              <div className="submenu" id="menu-submenu">
                <NavLink to="/menu" end aria-label="View all menu items">All Items</NavLink>
                <NavLink to="/menu/add" aria-label="Add new menu item">Add Menu Item</NavLink>
              </div>
            )}
          </div>
          <NavLink to="/categories" aria-label="View menu categories">
            ▦ <span>Categories</span>
          </NavLink>
          <NavLink to="/orders" aria-label="View orders">
            ▤ <span>Orders</span>
            <i aria-label="3 pending orders">3</i>
          </NavLink>
          <NavLink to="/tables" aria-label="View tables">
            ▦ <span>Tables</span>
          </NavLink>
          <NavLink to="/customers" aria-label="View customers">
            ♟ <span>Customers</span>
          </NavLink>
          <NavLink to="/users" aria-label="View users">
            ♙ <span>Users</span>
          </NavLink>
        </nav>
        <div className="sidebar-promo" aria-hidden="true">
          <div className="promo-dish">🍲</div>
          <strong>Good Food<br />Happy Customers</strong>
          <span>Great food brings people together. Keep serving the best!</span>
          <i />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
