import { Link } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import { categories } from "../data/category.data";

function CategoryGallery() {
  return (
    <section className="categories-page category-gallery-page">
      <CategoryHeader
        title="Categories Gallery"
        description="Visual view of all categories with quick actions."
        action={<div className="view-switch"><Link className="selected" to="/categories/gallery">▦ Grid View</Link><Link to="/categories">☷ List View</Link></div>}
      />
      <div className="gallery-grid">
        {categories.map((category) => (
          <article className="gallery-card" key={category.id}>
            <div className="gallery-image"><img src={category.image} alt={category.name} /><button aria-label={`Add item to ${category.name}`}>+</button></div>
            <div className="gallery-card-content"><div><Link to={`/categories/${category.id}`}><h2>{category.name}</h2></Link><p>{category.items} items</p></div><span className={`status ${category.status.toLowerCase()}`}>{category.status}</span></div>
            <div className="gallery-actions"><Link to={`/categories/${category.id}/edit`} aria-label={`Edit ${category.name}`}>↗</Link><Link to={`/categories/${category.id}`} aria-label={`View ${category.name}`}>◉</Link></div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CategoryGallery;