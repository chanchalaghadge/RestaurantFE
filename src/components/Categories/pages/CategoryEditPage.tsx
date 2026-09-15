import { Link, useParams } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import CategoryForm from "../components/CategoryForm";
import { categories } from "../data/category.data";

function CategoryEditPage() { const { id } = useParams(); const category = categories.find((item) => item.id === id) ?? categories[0]; return <section className="categories-page category-detail-page"><CategoryHeader title={`Edit ${category.name}`} description="Update the category details and menu visibility settings." action={<Link className="secondary-button" to={`/categories/${category.id}`}>← View Category</Link>} /><div className="form-panel"><div className="form-panel-heading"><h2>Edit Category Details</h2><p>Changes will be reflected across the menu immediately.</p></div><CategoryForm category={category} mode="edit" /></div></section>; }

export default CategoryEditPage;