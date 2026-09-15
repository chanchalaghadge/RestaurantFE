import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../../types/category/category.types";

type CategoryFormProps = { category?: Category; mode: "create" | "edit" };

function CategoryForm({ category, mode }: CategoryFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug.replace("/", "") ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [status, setStatus] = useState(category?.status ?? "Active");
  const [displayOrder, setDisplayOrder] = useState(category ? "1" : "");
  const [image, setImage] = useState(category?.image ?? "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=220&fit=crop");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/categories");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  return <form className="category-form" onSubmit={handleSubmit}>
    <div className="category-form-columns">
      <div className="category-information">
        <h3>Category Information</h3>
        <label>Category Name <b>*</b><input required value={name} onChange={(event) => { setName(event.target.value); if (!category) setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-")); }} placeholder="e.g. Pizza" /></label>
        <label>URL Slug <b>*</b><input required value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="e.g. pizza" /></label>
        <label>Description <b>*</b><textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Enter category description..." /></label>
        <label>Status</label><div className="status-toggle"><button type="button" className={status === "Active" ? "selected" : ""} onClick={() => setStatus("Active")}>Active</button><button type="button" className={status === "Inactive" ? "selected inactive-selected" : ""} onClick={() => setStatus("Inactive")}>Inactive</button></div>
        <label>Display Order<input type="number" min="1" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} placeholder="1" /><small>ⓘ The display order determines the position of this category<br />on the menu list.</small></label>
      </div>
      <div className="category-image-column">
        <h3>Category Image</h3>
        <button type="button" className="upload-box" onClick={() => fileInputRef.current?.click()}><span>▣</span><strong>Click to upload or drag and drop</strong><small>Supports: JPG, PNG, WebP (Max. 2MB)</small></button>
        <input ref={fileInputRef} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
        <div className="image-preview-heading">Preview</div><div className="image-preview"><img src={image} alt="Category preview" /><button type="button" onClick={() => setImage("")}>▢ Remove</button></div>
      </div>
    </div>
    <div className="form-actions"><button type="button" onClick={() => navigate(-1)}>Cancel</button><button className="primary-button" type="submit">✦ {mode === "create" ? "Save Category" : "Save Changes"}</button></div>
  </form>;
}

export default CategoryForm;