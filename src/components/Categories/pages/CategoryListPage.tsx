import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import { imageUrl, useDefaultImageOnError } from "../../../utils/image";
import LoadingSpinner from "../../common/LoadingSpinner";
import Breadcrumb from "../../common/Breadcrumb";
import { useTableSort } from "../../../hooks/useTableSort";
import { exportToCsv, generateTimestamp } from "../../../utils/csvExport";

function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<CategoryApi | null>(null);
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
  
  const filtered = categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()));
  const { sortedData, sortConfig, handleSort, getSortIcon } = useTableSort(filtered);

  const handleExport = () => {
    const columns = [
      { key: 'name', label: 'Category Name' },
      { key: 'description', label: 'Description', formatter: (val: string) => val || 'N/A' },
      { key: 'imageUrl', label: 'Image URL', formatter: (val: string) => val || 'N/A' }
    ];
    exportToCsv(sortedData, columns, `categories-export-${generateTimestamp()}.csv`);
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
      {error && <p role="alert">{error}</p>}
      <div className="category-panel">
        <div className="panel-header">
          <h2>Category List</h2>
          <div className="filters">
            <label className="search-box">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." />
            </label>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
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
              {sortedData.map((category) => (
                <tr key={category.id}>
                  <td><img className="category-image" src={imageUrl(category.imageUrl)} onError={useDefaultImageOnError} alt="" /></td>
                  <td><Link className="category-name" to={`/categories/${category.id}/edit`}>{category.name}</Link></td>
                  <td className="description">{category.description}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/categories/${category.id}/edit`}>↗</Link>
                      <button className="delete" onClick={() => setDeleting(category)}>♲</button>
                    </div>
                  </td>
                </tr>
              ))}
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
            categoriesApi.remove(deleting.id).then(() => { 
              setDeleting(null); 
              void load(); 
            }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to delete category.")); 
          }} 
        />
      )}
    </section>
  );
}
export default CategoryListPage;
