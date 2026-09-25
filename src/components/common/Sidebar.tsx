import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ordersApi } from "../../api/orders.api";
import "./Sidebar.css";

const promoImages = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=480&q=80",
];

function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [promoImageIndex, setPromoImageIndex] = useState(0);
  const [incompleteOrderCount, setIncompleteOrderCount] = useState(0);
  const location = useLocation();
  const menuIsActive = location.pathname.startsWith("/menu");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPromoImageIndex((current) => (current + 1) % promoImages.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadIncompleteOrderCount = async () => {
      try {
        const orders = await ordersApi.list();
        setIncompleteOrderCount(orders.filter((order) => order.status !== "Completed" && order.status !== "Cancelled").length);
      } catch {
        setIncompleteOrderCount(0);
      }
    };

    void loadIncompleteOrderCount();
    const interval = window.setInterval(() => void loadIncompleteOrderCount(), 30000);
    return () => window.clearInterval(interval);
  }, [location.pathname]);

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
            {incompleteOrderCount > 0 && <i aria-label={`${incompleteOrderCount} incomplete orders`}>{incompleteOrderCount}</i>}
          </NavLink>
          <NavLink to="/tables" aria-label="View tables">
            ▦ <span>Tables</span>
          </NavLink>
          <NavLink to="/kitchen" aria-label="Open kitchen display">
            🍳 <span>Kitchen Display</span>
          </NavLink>
          <NavLink to="/customers" aria-label="View customers">
            ♟ <span>Customers</span>
          </NavLink>
          <NavLink to="/users" aria-label="View users">
            ♙ <span>Users</span>
          </NavLink>
        </nav>
        <div className="sidebar-promo" aria-hidden="true">
          <div className="promo-dish">
            <img key={promoImages[promoImageIndex]} src={promoImages[promoImageIndex]} alt="" />
          </div>
          <strong>Good Food<br />Happy Customers</strong>
          <span>Great food brings people together. Keep serving the best!</span>
          <i />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
