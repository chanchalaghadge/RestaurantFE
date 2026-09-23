import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import CategoryForm from "../components/CategoryForm";
import Breadcrumb from "../../common/Breadcrumb";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";
import ErrorAlert from "../../common/ErrorAlert";
import "../Categories.css";

function CategoryEditPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<CategoryApi | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      categoriesApi.get(Number(id))
        .then(setCategory)
        .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unable to load category."));
    }
  }, [id]);

  if (error) return <section className="categories-page category-detail-page"><ErrorAlert message={error} /></section>;
  if (!category) return <p>Loading category...</p>;

  return (
    <section className="categories-page category-detail-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Categories', path: '/categories' }, { label: `Edit ${category.name}` }]} />
      <CategoryHeader title={`Edit ${category.name}`} description="Update category details." />
      <div className="form-panel">
        <CategoryForm category={category} mode="edit" />
      </div>
    </section>
  );
}
export default CategoryEditPage;
