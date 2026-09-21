import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { MenuItem } from "../../../types/menu/menu-item.types";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import BulkDeleteModal from "../../common/BulkDeleteModal";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import ErrorAlert from "../../common/ErrorAlert";
import "../MenuItems.css";
import { menuItemsApi, type MenuItemApi, type MenuItemSummary } from "../../../api/menu-items.api";
import { imageUrl, useDefaultImageOnError } from "../../../utils/image";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";
import { useToast } from "../../common/Toast";
import { formatCurrency } from "../../../utils/currency";

function MenuItemsListPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [dietary, setDietary] = useState("All Dietary");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<MenuItemSummary>({ totalItems: 0, activeItems: 0, categoryCount: 0, variationCount: 0 });
  const [loading, setLoading] = useState(true);
  const loadSummary = () => menuItemsApi.summary().then(setSummary).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load menu summary."));
  useEffect(() => { categoriesApi.list().then(setCategories).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load categories.")); }, []);
  useEffect(() => { void loadSummary(); }, []);
  useEffect(() => { 
    setLoading(true);
    menuItemsApi.list({ search, categoryId: categoryId ? Number(categoryId) : undefined, status: status === "All Status" ? undefined : status }).then((data) => {
      setItems(data.map((item: MenuItemApi) => ({ id: String(item.id), code: item.code, name: item.name, category: item.categoryName, description: item.description, price: item.price, preparationTime: item.preparationTimeMinutes, calories: item.calories ?? 0, ingredients: item.ingredients ?? "", status: item.status, dietary: item.dietaryType, image: item.imageUrl ?? "" })));
      setLoading(false);
    }).catch((requestError: unknown) => {
      setError(requestError instanceof Error ? requestError.message : "Unable to load menu items.");
      setLoading(false);
    }); 
  }, [search, categoryId, status]);
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
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedItems = visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setPage(1); }, [search, categoryId, dietary, status, pageSize]);

  if (loading) {
    return (
      <section className="items-page items-list-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Menu', path: '/menu' }, { label: 'All Items' }]} />
        <div className="items-heading">
          <div>
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
        <LoadingSpinner text="Loading menu items..." fullScreen />
      </section>
    );
  }

  const handleDelete = (item: MenuItem) => {
    setIsDeleting(true);
    menuItemsApi.remove(Number(item.id)).then(() => {
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setItemToDelete(null);
      setIsDeleting(false);
      showToast('Menu item deleted successfully', 'success');
      void loadSummary();
    }).catch((requestError: unknown) => {
      setIsDeleting(false);
      setError(requestError instanceof Error ? requestError.message : "Unable to delete menu item.");
      showToast('Failed to delete menu item', 'error');
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(pagedItems.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBulkDeleting(true);
      await Promise.all(Array.from(selectedIds).map(id => menuItemsApi.remove(Number(id))));
      setItems((current) => current.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setBulkDeleting(false);
      showToast(`${selectedIds.size} menu item(s) deleted successfully`, 'success');
      void loadSummary();
    } catch (requestError) {
      setBulkDeleting(false);
      setError(requestError instanceof Error ? requestError.message : "Unable to delete menu items.");
      showToast('Failed to delete menu items', 'error');
    }
  };

  return (
    <section className="items-page items-list-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Menu', path: '/menu' }, { label: 'All Items' }]} />
      <div className="items-heading">
        <div>
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
      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
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
          {selectedIds.size > 0 && (
            <button
              className="clear-filters"
              onClick={() => setBulkDeleting(true)}
              disabled={bulkDeleting}
              style={{ background: '#fee2e2', borderColor: '#fecaca', color: '#991b1b' }}
            >
              Delete {selectedIds.size} Selected
            </button>
          )}
        </div>
        <div className="items-table-wrap">
          <table className="items-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={pagedItems.length > 0 && pagedItems.every((item) => selectedIds.has(item.id))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all items"
                  />
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
              {pagedItems.length ? pagedItems.map((item) => (
                <tr key={item.id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      aria-label={`Select ${item.name}`}
                    />
                  </td>
                  <td>
                    <img src={imageUrl(item.image)} onError={useDefaultImageOnError} alt={item.name} />
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
                  <td>{formatCurrency(item.price)}</td>
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
                    <span className={`item-status ${item.status === "Inactive" ? "inactive" : ""}`}>{item.status}</span>
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
                        disabled={isDeleting}
                      >
                        ♲
                      </button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={11}><div className="list-empty-state"><span>🍽</span><strong>No items yet</strong><p>Add your first menu item to begin building your menu.</p><Link className="primary-button" to="/menu/add">Add New Item</Link></div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="items-footer">
          <span>Showing {visibleItems.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, visibleItems.length)} of {visibleItems.length} items</span>
          <div className="pagination-controls">
            <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Previous page">‹</button>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} className={pageNumber === currentPage ? "current" : ""} onClick={() => setPage(pageNumber)}>{pageNumber}</button>
            ))}
            <button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} aria-label="Next page">›</button>
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} aria-label="Items per page">
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
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
          isDeleting={isDeleting}
        />
      )}
      {bulkDeleting && (
        <BulkDeleteModal
          count={selectedIds.size}
          itemType="Menu Item"
          onCancel={() => setBulkDeleting(false)}
          onConfirm={handleBulkDelete}
          isDeleting={bulkDeleting}
        />
      )}
    </section>
  );
}

export default MenuItemsListPage;
