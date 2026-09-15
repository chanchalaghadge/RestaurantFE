import { Link, useLocation } from "react-router-dom";
import "./UnderDevelopment.css";

const pageNames: Record<string, string> = {
  "/menu": "Menu Items",
  "/menu/add": "Add Menu Item",
  "/ingredients": "Ingredients",
  "/orders": "Orders",
  "/reservations": "Reservations",
  "/customers": "Customers",
  "/reports": "Reports",
  "/settings": "Settings",
};

function UnderDevelopment() {
  const { pathname } = useLocation();
  const pageName = pageNames[pathname] ?? "This module";

  return (
    <section className="development-page" aria-labelledby="development-title">
      <div className="development-card">
        <div className="development-animation" aria-hidden="true">
          <div className="development-sun" />
          <div className="development-cloud cloud-one" />
          <div className="development-cloud cloud-two" />
          <div className="development-worker">👨‍🍳</div>
          <div className="development-board"><span>⚙</span><span>▦</span><span>✦</span></div>
          <div className="development-ground" />
        </div>
        <span className="development-label">Coming soon</span>
        <h1 id="development-title">{pageName} is under development</h1>
        <p>This workspace is being prepared for your restaurant team. The category module is ready, and this section will follow soon.</p>
        <Link className="development-button" to="/categories">Back to Categories</Link>
      </div>
    </section>
  );
}

export default UnderDevelopment;