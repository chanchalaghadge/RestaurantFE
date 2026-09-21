import { Link } from "react-router-dom";
import "../Categories.css";

type CategoryHeaderProps = { title: string; description: string; action?: React.ReactNode; compact?: boolean };

function CategoryHeader({ title, description, action, compact = false }: CategoryHeaderProps) {
  return <div className={`page-heading${compact ? " compact" : ""}`}><div><div className="breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><Link to="/categories">Menu</Link><span>/</span><strong>{title}</strong></div>{!compact && <><h1>{title}</h1><p>{description}</p></>}</div>{action}</div>;
}

export default CategoryHeader;
