import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("restaurant-access-token");
    localStorage.removeItem("restaurant-user");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <label className="global-search">⌕ <input placeholder="Search categories, menu items..." /></label>
      </div>

      <div className="header-right">
        <button className="notification" aria-label="Notifications">♧<i /></button><div className="profile"><span className="avatar">A</span><span><strong>Admin</strong><small>Restaurant Manager</small></span><b>⌄</b></div><button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Header;
