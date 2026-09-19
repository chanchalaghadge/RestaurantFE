import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("restaurant-access-token");
    localStorage.removeItem("restaurant-user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("restaurant-user") || '{"name":"Admin"}');

  return (
    <header className="header" role="banner">
      <div className="header-left">
        <label className="global-search">
          <span aria-hidden="true">⌕</span>
          <input placeholder="Search categories, menu items..." />
        </label>
      </div>

      <div className="header-right">
        <button 
          className="notification" 
          aria-label="Notifications"
        >
          <span aria-hidden="true">♧</span>
          <i aria-hidden="true" />
        </button>
        <div className="profile">
          <span className="avatar" aria-hidden="true">{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
          <span>
            <strong>{user.name || 'Admin'}</strong>
            <small>Restaurant Manager</small>
          </span>
          <b aria-hidden="true">⌄</b>
        </div>
        <button 
          className="logout-button" 
          onClick={handleLogout}
          aria-label="Logout from your account"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
