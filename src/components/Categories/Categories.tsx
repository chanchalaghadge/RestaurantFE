import { useState } from "react";
import { Link } from "react-router-dom";
import "./Categories.css";

type Category = {
  name: string;
  slug: string;
  description: string;
  items: number;
  status: "Active" | "Inactive";
  image: string;
};

const categories: Category[] = [
  { name: "Pizza", slug: "/pizza", description: "Freshly made pizzas with premium ingredients and authentic flavors.", items: 6, status: "Active", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=160&h=160&fit=crop" },
  { name: "Burgers", slug: "/burgers", description: "Juicy burgers with fresh vegetables and special sauces.", items: 5, status: "Active", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=160&h=160&fit=crop" },
  { name: "Pasta", slug: "/pasta", description: "Classic and modern pasta dishes for every taste.", items: 4, status: "Active", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=160&h=160&fit=crop" },
  { name: "Salads", slug: "/salads", description: "Fresh, healthy and delicious salads made with the best ingredients.", items: 3, status: "Active", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=160&h=160&fit=crop" },
  { name: "Beverages", slug: "/beverages", description: "Refreshing drinks, mocktails and classic beverages.", items: 6, status: "Active", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=160&h=160&fit=crop" },
  { name: "Desserts", slug: "/desserts", description: "Sweet endings to make your meal more special.", items: 4, status: "Active", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=160&h=160&fit=crop" },
  { name: "Appetizers", slug: "/appetizers", description: "Perfect starters to kick off your meal.", items: 3, status: "Active", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=160&h=160&fit=crop" },
  { name: "Seafood", slug: "/seafood", description: "Fresh seafood cooked with special spices and herbs.", items: 2, status: "Inactive", image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=160&h=160&fit=crop" },
];

function Categories() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [showForm, setShowForm] = useState(false);
  const visibleCategories = categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()) && (status === "All Status" || category.status === status));

  return (
    <section className="categories-page">
      <div className="page-heading"><div><div className="breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><span>Menu</span><span>/</span><strong>Categories</strong></div><h1>Manage Categories</h1><p>Organize your menu with categories. You can add, edit, delete, and manage the status of each category.</p></div><button className="primary-button" onClick={() => setShowForm(true)}><span>+</span> Add New Category</button></div>
      <div className="category-stats">
        <article className="stat-card"><div className="stat-icon green">▦</div><div><strong>8</strong><span>Total Categories</span><em>Active: 7</em></div></article>
        <article className="stat-card"><div className="stat-icon blue">●</div><div><strong>24</strong><span>Total Menu Items</span><em>Across all categories</em></div></article>
        <article className="stat-card"><div className="stat-icon orange">♜</div><div><strong>7</strong><span>Active Categories</span><em className="red">1 Inactive</em></div></article>
        <article className="stat-card top-category"><div className="stat-icon purple">★</div><div><span>Top Category</span><strong>Pizza</strong><em>(6 items)</em></div><img src={categories[0].image} alt="Pizza" /></article>
      </div>
      <div className="category-panel">
        <div className="panel-header"><h2>Category List</h2><div className="filters"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All Status</option><option>Active</option><option>Inactive</option></select><select defaultValue="All Categories"><option>All Categories</option></select><button className="reset-button" onClick={() => { setSearch(""); setStatus("All Status"); }}>↻ Reset</button></div></div>
        <div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Select all categories" /></th><th>Image</th><th>Category Name</th><th>Description</th><th>Menu Items</th><th>Status</th><th>Sort Order</th><th>Actions</th></tr></thead><tbody>{visibleCategories.map((category, index) => <tr key={category.name}><td><input type="checkbox" aria-label={`Select ${category.name}`} /></td><td><img className="category-image" src={category.image} alt={category.name} /></td><td><Link className="category-name" to={category.slug}>{category.name}</Link><small>{category.slug}</small></td><td className="description">{category.description}</td><td>{category.items}</td><td><span className={`status ${category.status.toLowerCase()}`}>{category.status}</span></td><td>{index + 1}<span className="drag">⠿</span></td><td><div className="row-actions"><button aria-label={`Edit ${category.name}`}>↗</button><button aria-label={`View ${category.name}`}>◉</button><button className="delete" aria-label={`Delete ${category.name}`}>♲</button></div></td></tr>)}</tbody></table></div>
        <div className="table-footer"><span>Showing 1 to {visibleCategories.length} of 8 categories</span><div><button>‹</button><button className="current">1</button><button>›</button></div></div>
      </div>
      {showForm && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="category-modal"><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">×</button><h2>Add New Category</h2><p>Create a category for your menu.</p><input placeholder="Category name" autoFocus /><textarea placeholder="Description" /><div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" onClick={() => setShowForm(false)}>Save Category</button></div></div></div>}
    </section>
  );
}

export default Categories;