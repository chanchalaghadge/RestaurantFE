import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryHeader from "../components/CategoryHeader";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";
import ConfirmDeleteModal from "../../common/ConfirmDeleteModal";
import { imageUrl, useDefaultImageOnError } from "../../../utils/image";

function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryApi[]>([]); const [search, setSearch] = useState(""); const [deleting, setDeleting] = useState<CategoryApi | null>(null); const [error, setError] = useState("");
  const load = async () => { try { setCategories(await categoriesApi.list()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load categories."); } };
  useEffect(() => { void load(); }, []); const visible = categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()));
  return <section className="categories-page"><CategoryHeader title="Manage Categories" description="Organize your menu with categories." action={<Link className="primary-button" to="/categories/new"><span>+</span> Add New Category</Link>} />{error && <p role="alert">{error}</p>}<div className="category-panel"><div className="panel-header"><h2>Category List</h2><div className="filters"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." /></label></div></div><div className="table-wrap"><table><thead><tr><th>Image</th><th>Category Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>{visible.map((category) => <tr key={category.id}><td><img className="category-image" src={imageUrl(category.imageUrl)} onError={useDefaultImageOnError} alt="" /></td><td><Link className="category-name" to={`/categories/${category.id}/edit`}>{category.name}</Link></td><td className="description">{category.description}</td><td><div className="row-actions"><Link to={`/categories/${category.id}/edit`}>↗</Link><button className="delete" onClick={() => setDeleting(category)}>♲</button></div></td></tr>)}</tbody></table></div><div className="table-footer">Showing {visible.length} of {categories.length} categories</div></div>{deleting && <ConfirmDeleteModal itemName={deleting.name} itemType="Category" onCancel={() => setDeleting(null)} onConfirm={() => { categoriesApi.remove(deleting.id).then(() => { setDeleting(null); void load(); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to delete category.")); }} />}</section>;
}
export default CategoryListPage;
