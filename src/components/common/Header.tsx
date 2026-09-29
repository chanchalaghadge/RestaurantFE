import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { authApi } from "../../api/auth.api";
import { api } from "../../api/client";
import { formatDate, formatTime } from "../../utils/date";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  const [branches, setBranches] = useState<Array<{ id: number; name: string; isDefault: boolean }>>([]);
  const [activeBranchId, setActiveBranchId] = useState("");
  const [tenants, setTenants] = useState<Array<{ id: number; name: string }>>([]);
  const [activeTenantId, setActiveTenantId] = useState("");
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api<{ id: number; name: string; branches: Array<{ id: number; name: string; isDefault: boolean }>; isPlatformAdmin: boolean; tenants: Array<{ id: number; name: string }> }>("/api/tenants/current")
      .then((tenant) => {
        if (cancelled) return;
        setIsPlatformAdmin(tenant.isPlatformAdmin);
        const availableTenants = tenant.tenants ?? [];
        setTenants(availableTenants);
        if (tenant.isPlatformAdmin) {
          const savedTenant = localStorage.getItem("restaurant-tenant-id") ?? "";
          const selectedTenant = availableTenants.some((item) => String(item.id) === savedTenant) ? savedTenant : String(tenant.id);
          setActiveTenantId(selectedTenant);
          if (selectedTenant && selectedTenant !== savedTenant) {
            localStorage.setItem("restaurant-tenant-id", selectedTenant);
            localStorage.removeItem("restaurant-branch-id");
            window.location.reload();
            return;
          }
        } else {
          localStorage.removeItem("restaurant-tenant-id");
        }
        const availableBranches = tenant.branches ?? [];
        setBranches(availableBranches);
        const saved = localStorage.getItem("restaurant-branch-id") ?? "";
        const selected = availableBranches.some((branch) => String(branch.id) === saved)
          ? saved
          : String(availableBranches.find((branch) => branch.isDefault)?.id ?? availableBranches[0]?.id ?? "");
        if (selected) {
          setActiveBranchId(selected);
          if (selected !== saved) {
            localStorage.setItem("restaurant-branch-id", selected);
            window.location.reload();
          }
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const changeBranch = (branchId: string) => {
    if (!branchId || branchId === activeBranchId) return;
    localStorage.setItem("restaurant-branch-id", branchId);
    setActiveBranchId(branchId);
    window.location.reload();
  };

  const changeTenant = (tenantId: string) => {
    if (!tenantId || tenantId === activeTenantId) return;
    localStorage.setItem("restaurant-tenant-id", tenantId);
    localStorage.removeItem("restaurant-branch-id");
    setActiveTenantId(tenantId);
    window.location.reload();
  };

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem("restaurant-user");
    localStorage.removeItem("restaurant-tenant-id");
    localStorage.removeItem("restaurant-branch-id");
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

      <div className="header-center" aria-label={`Current date and time: ${formatDate(now)}, ${formatTime(now)}`}>
        <span aria-hidden="true">▣</span>
        <strong>{formatDate(now)}</strong>
        <i aria-hidden="true" />
        <span aria-hidden="true">◷</span>
        <strong>{formatTime(now)}</strong>
      </div>

      <div className="header-right">
        {isPlatformAdmin && tenants.length > 1 && <select className="tenant-selector" value={activeTenantId} onChange={(event) => changeTenant(event.target.value)} aria-label="Select client restaurant">
          {tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
        </select>}
        {branches.length > 1 && <select className="branch-selector" value={activeBranchId} onChange={(event) => changeBranch(event.target.value)} aria-label="Select restaurant branch">
          {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>}
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
        <details className="profile">
          <summary aria-label="Open profile menu">
            <span className="avatar" aria-hidden="true">{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
            <span className="profile-details">
              <strong>{user.name || 'Admin'}</strong>
              <small>Restaurant Manager</small>
            </span>
            <b aria-hidden="true">⌄</b>
          </summary>
          <div className="profile-menu" role="menu">
            <button type="button" role="menuitem" onClick={handleLogout}>
              <span aria-hidden="true">⇥</span> {t.common.logout}
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}

export default Header;
