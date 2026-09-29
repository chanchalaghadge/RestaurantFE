import CategoryHeader from "../components/CategoryHeader";
import CategoryForm from "../components/CategoryForm";
import "../Categories.css";

function CategoryCreatePage() {
  return (
    <section className="categories-page category-detail-page category-create-page">
      <CategoryHeader title="Add New Category" />
      <div className="form-panel">
        <CategoryForm mode="create" />
      </div>
    </section>
  );
}

export default CategoryCreatePage;
