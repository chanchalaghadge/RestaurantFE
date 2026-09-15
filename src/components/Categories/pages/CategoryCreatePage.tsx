import CategoryHeader from "../components/CategoryHeader";
import CategoryForm from "../components/CategoryForm";

function CategoryCreatePage() { return <section className="categories-page category-detail-page"><CategoryHeader title="Add New Category" description="Create a new category for your menu. Fill in the details below." /><div className="form-panel"><CategoryForm mode="create" /></div></section>; }

export default CategoryCreatePage;