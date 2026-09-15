import { Link } from "react-router-dom";
import "../Categories.css";

type CategoryHeaderProps = { title: string; description: string; action?: React.ReactNode };

function CategoryHeader({ title, description, action }: CategoryHeaderProps) {
  return <div className="page-heading"><div><div className="breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><Link to="/categories">Menu</Link><span>/</span><strong>{title}</strong></div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export default CategoryHeader;