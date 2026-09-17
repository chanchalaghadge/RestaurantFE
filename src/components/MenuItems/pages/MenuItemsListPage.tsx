import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MenuItem } from "../../../types/menu/menu-item.types";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import "../MenuItems.css";
import { menuItemsApi, type MenuItemApi, type MenuItemSummary } from "../../../api/menu-items.api";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";

function MenuItemsListPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [dietary, setDietary] = useState("All Dietary");
  const [status, setStatus] = useState("All Status");
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<MenuItemSummary>({ totalItems: 0, activeItems: 0, categoryCount: 0, variationCount: 0 });
  const loadSummary = () => menuItemsApi.summary().then(setSummary).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load menu summary."));
  useEffect(() => { categoriesApi.list().then(setCategories).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load categories.")); }, []);
  useEffect(() => { void loadSummary(); }, []);
  useEffect(() => { menuItemsApi.list({ search, categoryId: categoryId ? Number(categoryId) : undefined, status: status === "All Status" ? undefined : status }).then((data) => setItems(data.map((item: MenuItemApi) => ({ id: String(item.id), code: item.code, name: item.name, category: item.categoryName, description: item.description, price: item.price, preparationTime: item.preparationTimeMinutes, calories: item.calories ?? 0, ingredients: item.ingredients ?? "", status: item.status, dietary: item.dietaryType, image: item.imageUrl ?? "" })))).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load menu items.")); }, [search, categoryId, status]);
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) &&
          (dietary === "All Dietary" || item.dietary === dietary) &&
          (status === "All Status" || item.status === status),
      ),
    [items, search, dietary, status],
  );

  const handleDelete = (item: MenuItem) => {
    menuItemsApi.remove(Number(item.id)).then(() => { setItems((current) => current.filter((currentItem) => currentItem.id !== item.id)); setItemToDelete(null); void loadSummary(); }).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to delete menu item."));
  };

  return (
    <section className="items-page">
      <div className="items-heading">
        <div>
          <div className="breadcrumb">
            <Link to="/dashboard">Home</Link>
            <span>/</span>
            <Link to="/menu">Menu</Link>
            <span>/</span>
            <strong>All Items</strong>
          </div>
          <h1>Items</h1>
          <p>
            Manage your restaurant food &amp; beverage items. Add, edit, delete,
            and manage variations.
          </p>
        </div>
        <Link className="primary-button" to="/menu/add">
          <span>+</span> Add New Item
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="item-stats">
        <article>
          <span className="item-stat-icon green">♜</span>
          <div>
            <strong>{summary.totalItems}</strong>
            <small>Total Items</small>
            <em className="neutral">From backend</em>
          </div>
        </article>
        <article>
          <span className="item-stat-icon blue">✓</span>
          <div>
            <strong>{summary.activeItems}</strong>
            <small>Active Items</small>
            <em className="neutral">From backend</em>
          </div>
        </article>
        <article>
          <span className="item-stat-icon orange">▣</span>
          <div>
            <strong>{summary.categoryCount}</strong>
            <small>Categories</small>
            <em className="neutral">No change</em>
          </div>
        </article>
        <article>
          <span className="item-stat-icon purple">★</span>
          <div>
            <strong>{summary.variationCount}</strong>
            <small>Variations</small>
            <em className="neutral">From backend</em>
          </div>
        </article>
      </div>
      <div className="items-panel">
        <div className="items-filters">
          <label className="items-search">
            ⌕
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item name / short code..."
            />
          </label>
          <label>
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            Dietary
            <select
              value={dietary}
              onChange={(event) => setDietary(event.target.value)}
            >
              <option>All Dietary</option>
              <option>Veg</option>
              <option>Non-Veg</option>
            </select>
          </label>
          <label>
            GST
            <select>
              <option>All GST</option>
              <option>5%</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <button
            className="clear-filters"
            onClick={() => {
              setSearch("");
              setCategoryId("");
              setDietary("All Dietary");
              setStatus("All Status");
            }}
          >
            ↻ Clear
          </button>
        </div>
        <div className="items-table-wrap">
          <table className="items-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="Select all items" />
                </th>
                <th>Image</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Dietary</th>
                <th>GST</th>
                <th>Available For</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length ? visibleItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input type="checkbox" aria-label={`Select ${item.name}`} />
                  </td>
                  <td>
                    <img src={item.image} alt={item.name} />
                  </td>
                  <td>
                    <Link to={`/menu/${item.id}/edit`} className="item-name">
                      {item.name}
                    </Link>
                    <small>({item.code})</small>
                  </td>
                  <td>
                    <span className="item-pill category-pill">
                      {item.category}
                    </span>
                  </td>
                  <td>₹{item.price}</td>
                  <td>
                    <span
                      className={`item-pill dietary-pill ${item.dietary === "Veg" ? "veg" : "non-veg"}`}
                    >
                      {item.dietary}
                    </span>
                  </td>
                  <td>
                    <span className="gst-pill">5%</span>
                  </td>
                  <td>
                    <span className="availability-pill">Dine-in</span>
                    <span className="availability-pill">Delivery</span>
                  </td>
                  <td>
                    <span className="item-status">{item.status}</span>
                  </td>
                  <td>
                    <div className="item-actions">
                      <Link
                        to={`/menu/${item.id}/edit`}
                        aria-label={`Edit ${item.name}`}
                      >
                        ↗
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => setItemToDelete(item)}
                      >
                        ♲
                      </button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={10}><div className="list-empty-state"><span>🍽</span><strong>No items yet</strong><p>Add your first menu item to begin building your menu.</p><Link className="primary-button" to="/menu/add">Add New Item</Link></div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="items-footer">
          <span>Showing {visibleItems.length} of {summary.totalItems} items</span>
          <div>
            <button>‹</button>
            <button className="current">1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>›</button>
            <select>
              <option>10 / page</option>
            </select>
          </div>
        </div>
      </div>
      {itemToDelete && (
        <ConfirmDeleteModal
          itemName={itemToDelete.name}
          itemType="Menu Item"
          onCancel={() => setItemToDelete(null)}
          onConfirm={() => handleDelete(itemToDelete)}
        />
      )}
    </section>
  );
}

export default MenuItemsListPage;
