import { Link } from "react-router-dom";
import "../Categories.css";

type CategoryHeaderProps = { title: string; description?: string; action?: React.ReactNode; compact?: boolean; showBreadcrumb?: boolean };

function CategoryHeader({ title, description, action, compact = false, showBreadcrumb = true }: CategoryHeaderProps) {
  return <div className={`page-heading${compact ? " compact" : ""}`}><div>{showBreadcrumb && <div className="breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><Link to="/categories">Menu</Link><span>/</span><strong>{title}</strong></div>}{!compact && <><h1><span className="page-title-icon" aria-hidden="true">▦</span>{title}</h1>{description && <p>{description}</p>}</>}</div>{action}</div>;
}

export default CategoryHeader;
