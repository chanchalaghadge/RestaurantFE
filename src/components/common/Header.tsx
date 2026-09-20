import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { authApi } from "../../api/auth.api";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem("restaurant-user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("restaurant-user") || '{"name":"Admin"}');

  return (
    <header className="header" role="banner">
      <div className="header-left">
        <label className="global-search">
          <span aria-hidden="true">⌕</span>
          <input placeholder={t.common.search + " categories, menu items..."} />
        </label>
      </div>

      <div className="header-right">
        <select 
          className="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          aria-label="Select language"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
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
          {t.common.logout}
        </button>
      </div>
    </header>
  );
}

export default Header;
