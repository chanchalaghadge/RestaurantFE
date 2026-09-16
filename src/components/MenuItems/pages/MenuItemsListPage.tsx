import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { menuItems } from "../data/menu-item.data";
import type { MenuItem } from "../../../types/menu/menu-item.types";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import "../MenuItems.css";

const MENU_ITEMS_STORAGE_KEY = "restaurant-menu-items";

function MenuItemsListPage() {
  const [items, setItems] = useState<MenuItem[]>(() => {
    const storedItems = localStorage.getItem(MENU_ITEMS_STORAGE_KEY);
    return storedItems ? (JSON.parse(storedItems) as MenuItem[]) : menuItems;
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [dietary, setDietary] = useState("All Dietary");
  const [status, setStatus] = useState("All Status");
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) &&
          (category === "All Categories" || item.category === category) &&
          (dietary === "All Dietary" || item.dietary === dietary) &&
          (status === "All Status" || item.status === status),
      ),
    [items, search, category, dietary, status],
  );

  const handleDelete = (item: MenuItem) => {
    const updatedItems = items.filter((currentItem) => currentItem.id !== item.id);
    setItems(updatedItems);
    localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(updatedItems));
    setItemToDelete(null);
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
      <div className="item-stats">
        <article>
          <span className="item-stat-icon green">♜</span>
          <div>
            <strong>125</strong>
            <small>Total Items</small>
            <em>+12 this month</em>
          </div>
        </article>
        <article>
          <span className="item-stat-icon blue">✓</span>
          <div>
            <strong>110</strong>
            <small>Active Items</small>
            <em>+10 this month</em>
          </div>
        </article>
        <article>
          <span className="item-stat-icon orange">▣</span>
          <div>
            <strong>12</strong>
            <small>Categories</small>
            <em className="neutral">No change</em>
          </div>
        </article>
        <article>
          <span className="item-stat-icon purple">★</span>
          <div>
            <strong>48</strong>
            <small>Variations</small>
            <em>+6 this month</em>
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
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>All Categories</option>
              {[
                "Pizza",
                "Burgers",
                "Pasta",
                "Salads",
                "Beverages",
                "Desserts",
                "Appetizers",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
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
              setCategory("All Categories");
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
              {visibleItems.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>
        <div className="items-footer">
          <span>Showing 1 to {visibleItems.length} of 125 items</span>
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
