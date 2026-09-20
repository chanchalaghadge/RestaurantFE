import { Link, useParams } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import Breadcrumb from "../../common/Breadcrumb";
import { categories } from "../data/category.data";

function CategoryViewPage() {
  const { id } = useParams();
  const category = categories.find((item) => item.id === id) ?? categories[0];

  return (
    <section className="categories-page category-detail-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Categories', path: '/categories' }, { label: category.name }]} />
      <CategoryHeader
        title={category.name}
        description="Review category information and the dishes currently assigned to it."
        action={
          <div className="detail-actions">
            <Link className="secondary-button" to="/categories">← Categories</Link>
            <Link className="primary-button" to={`/categories/${category.id}/edit`}>↗ Edit Category</Link>
          </div>
        }
      />
      <div className="category-profile">
        <img src={category.image} alt={category.name} />
        <div className="category-profile-content">
          <span className={`status ${category.status.toLowerCase()}`}>{category.status}</span>
          <h2>{category.name}</h2>
          <p>{category.description}</p>
          <div className="profile-meta">
            <div><strong>{category.items}</strong><span>Menu Items</span></div>
            <div><strong>#{categories.findIndex((item) => item.id === category.id) + 1}</strong><span>Sort Order</span></div>
            <div><strong>{category.slug}</strong><span>Menu URL</span></div>
          </div>
        </div>
      </div>
      <div className="category-panel assigned-panel">
        <div className="panel-header">
          <h2>Assigned Menu Items</h2>
          <span className="panel-note">{category.items} items in this category</span>
        </div>
        <div className="empty-items">
          <span>☷</span>
          <h3>Menu items will appear here</h3>
          <p>Add dishes from the menu module to see them listed in this category.</p>
          <Link className="primary-button" to="/menu/add">Add Menu Item</Link>
        </div>
      </div>
    </section>
  );
}

export default CategoryViewPage;