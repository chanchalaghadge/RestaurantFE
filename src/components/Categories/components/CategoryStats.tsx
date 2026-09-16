import { categories } from "../data/category.data";

function CategoryStats() {
  const activeCount = categories.filter((category) => category.status === "Active").length;
  return <div className="category-stats"><article className="stat-card"><div className="stat-icon green">▦</div><div><strong>{categories.length}</strong><span>Total Categories</span><em>Active: {activeCount}</em></div></article><article className="stat-card"><div className="stat-icon blue">●</div><div><strong>24</strong><span>Total Menu Items</span><em>Across all categories</em></div></article><article className="stat-card"><div className="stat-icon orange">♜</div><div><strong>{activeCount}</strong><span>Active Categories</span><em className="red">{categories.length - activeCount} Inactive</em></div></article><article className="stat-card top-category"><div className="stat-icon purple">★</div><div><span>Top Category</span><strong>Pizza</strong><em>(6 items)</em></div><img src={categories[0].image} alt="Pizza" /></article></div>;
}

export default CategoryStats;