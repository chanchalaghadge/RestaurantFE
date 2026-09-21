import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import BulkDeleteModal from "../../common/BulkDeleteModal";
import { imageUrl, useDefaultImageOnError } from "../../../utils/image";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import { useTableSort } from "../../../hooks/useTableSort";
import { exportToCsv, generateTimestamp } from "../../../utils/csvExport";
import { useToast } from "../../common/Toast";
import ErrorAlert from "../../common/ErrorAlert";
import "../Categories.css";

function CategoryListPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<CategoryApi | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setCategories(await categoriesApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  
  const filtered = useMemo(() => 
    categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );
  const { sortedData, sortConfig, handleSort, getSortIcon } = useTableSort(filtered);

  const handleExport = () => {
    const columns = [
      { key: 'name', label: 'Category Name' },
      { key: 'description', label: 'Description', formatter: (val: string) => val || 'N/A' },
      { key: 'imageUrl', label: 'Image URL', formatter: (val: string) => val || 'N/A' }
    ];
    exportToCsv(sortedData, columns, `categories-export-${generateTimestamp()}.csv`);
    showToast('CSV exported successfully', 'success');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedData.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
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
      await Promise.all(Array.from(selectedIds).map(id => categoriesApi.remove(id)));
      setSelectedIds(new Set());
      setBulkDeleting(false);
      showToast(`${selectedIds.size} category(ies) deleted successfully`, 'success');
      void load();
    } catch (reason) {
      setBulkDeleting(false);
      setError(reason instanceof Error ? reason.message : "Unable to delete categories.");
      showToast('Failed to delete categories', 'error');
    }
  };

  if (loading) {
    return (
      <section className="categories-page category-list-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Categories' }]} />
        <CategoryHeader title="Manage Categories" description="Organize your menu with categories." action={<Link className="primary-button" to="/categories/new"><span>+</span> Add New Category</Link>} />
        <LoadingSpinner text="Loading categories..." fullScreen />
      </section>
    );
  }

  return (
    <section className="categories-page category-list-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Categories' }]} />
      <CategoryHeader 
        title="Manage Categories" 
        description="Organize your menu with categories." 
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="secondary-button" onClick={handleExport} disabled={sortedData.length === 0}>
              📥 Export CSV
            </button>
            <Link className="primary-button" to="/categories/new"><span>+</span> Add New Category</Link>
          </div>
        } 
      />
      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
      <div className="category-panel">
        <div className="panel-header">
          <h2>Category List</h2>
          <div className="filters">
            <label className="search-box">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." />
            </label>
            {selectedIds.size > 0 && (
              <button
                className="secondary-button"
                onClick={() => setBulkDeleting(true)}
                disabled={bulkDeleting}
              >
                Delete {selectedIds.size} Selected
              </button>
            )}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all categories"
                  />
                </th>
                <th>Image</th>
                <th
                  className="sortable"
                  onClick={() => handleSort('name')}
                  aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Category Name {sortConfig.key === 'name' && getSortIcon()}
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('description')}
                  aria-sort={sortConfig.key === 'description' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Description {sortConfig.key === 'description' && getSortIcon()}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length ? sortedData.map((category) => (
                <tr key={category.id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(category.id)}
                      onChange={(e) => handleSelectOne(category.id, e.target.checked)}
                      aria-label={`Select ${category.name}`}
                    />
                  </td>
                  <td><img className="category-image" src={imageUrl(category.imageUrl)} onError={useDefaultImageOnError} alt="" /></td>
                  <td><Link className="category-name" to={`/categories/${category.id}/edit`}>{category.name}</Link></td>
                  <td className="description">{category.description}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/categories/${category.id}/edit`}>↗</Link>
                      <button className="delete" onClick={() => setDeleting(category)} disabled={isDeleting}>♲</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4}>
                    <div className="list-empty-state">
                      <span>♟</span>
                      <strong>No categories yet</strong>
                      <p>Add your first category to organize your menu.</p>
                      <Link className="primary-button" to="/categories/new">Add New Category</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">Showing {sortedData.length} of {categories.length} categories</div>
      </div>
      {deleting && (
        <ConfirmDeleteModal
          itemName={deleting.name}
          itemType="Category"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            setIsDeleting(true);
            categoriesApi.remove(deleting.id).then(() => {
              setDeleting(null);
              setIsDeleting(false);
              showToast('Category deleted successfully', 'success');
              void load();
            }).catch((reason: unknown) => {
              setIsDeleting(false);
              setError(reason instanceof Error ? reason.message : "Unable to delete category.");
              showToast('Failed to delete category', 'error');
            });
          }}
          isDeleting={isDeleting}
        />
      )}
      {bulkDeleting && (
        <BulkDeleteModal
          count={selectedIds.size}
          itemType="Category"
          onCancel={() => setBulkDeleting(false)}
          onConfirm={handleBulkDelete}
          isDeleting={bulkDeleting}
        />
      )}
    </section>
  );
}
export default CategoryListPage;
