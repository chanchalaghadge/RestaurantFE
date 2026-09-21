import CategoryHeader from "../components/CategoryHeader";
import CategoryForm from "../components/CategoryForm";
import Breadcrumb from "../../common/Breadcrumb";
import "../Categories.css";

function CategoryCreatePage() {
  return (
    <section className="categories-page category-detail-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Categories', path: '/categories' }, { label: 'Add New Category' }]} />
      <CategoryHeader title="Add New Category" description="Create a new category for your menu. Fill in the details below." />
      <div className="form-panel">
        <CategoryForm mode="create" />
      </div>
    </section>
  );
}

export default CategoryCreatePage;