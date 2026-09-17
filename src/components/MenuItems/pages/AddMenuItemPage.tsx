import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { categoriesApi, type CategoryApi } from "../../../api/categories.api";
import { menuItemsApi, type MenuItemUpsert, type MenuOptionGroup } from "../../../api/menu-items.api";
import { uploadMenuItemImage } from "../../../api/uploads.api";
import "../MenuItems.css";

const emptyMenuItem = (): MenuItemUpsert => ({
  code: "", name: "", categoryId: 0, description: "", price: 0,
  preparationTimeMinutes: 0, calories: undefined, ingredients: "", status: "Active",
  dietaryType: "Veg", imageUrl: "", tags: "", optionGroups: [],
});

function AddMenuItemPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [form, setForm] = useState<MenuItemUpsert>(emptyMenuItem);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPreviewOption, setSelectedPreviewOption] = useState(0);

  useEffect(() => {
    categoriesApi.list().then((data) => {
      setCategories(data);
      setForm((current) => current.categoryId ? current : { ...current, categoryId: data[0]?.id ?? 0 });
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load categories."));
  }, []);

  useEffect(() => {
    if (!id) return;
    menuItemsApi.get(Number(id)).then((item) => setForm({
      code: item.code, name: item.name, categoryId: item.categoryId, description: item.description,
      price: item.price, preparationTimeMinutes: item.preparationTimeMinutes, calories: item.calories,
      ingredients: item.ingredients ?? "", status: item.status, dietaryType: item.dietaryType,
      imageUrl: item.imageUrl ?? "", tags: item.tags ?? "", optionGroups: item.optionGroups ?? [],
    })).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load menu item."));
  }, [id]);

  const update = <K extends keyof MenuItemUpsert>(key: K, value: MenuItemUpsert[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setGroups = (optionGroups: MenuOptionGroup[]) => update("optionGroups", optionGroups);
  const addGroup = () => setGroups([...form.optionGroups, { name: `Option Group ${form.optionGroups.length + 1}`, isRequired: false, options: [{ name: "New option", priceAdjustment: 0 }] }]);
  const updateGroup = (groupIndex: number, patch: Partial<MenuOptionGroup>) => setGroups(form.optionGroups.map((group, index) => index === groupIndex ? { ...group, ...patch } : group));
  const removeGroup = (groupIndex: number) => setGroups(form.optionGroups.filter((_, index) => index !== groupIndex));
  const addOption = (groupIndex: number) => updateGroup(groupIndex, { options: [...form.optionGroups[groupIndex].options, { name: "New option", priceAdjustment: 0 }] });
  const updateOption = (groupIndex: number, optionIndex: number, patch: { name?: string; priceAdjustment?: number }) => updateGroup(groupIndex, { options: form.optionGroups[groupIndex].options.map((option, index) => index === optionIndex ? { ...option, ...patch } : option) });
  const removeOption = (groupIndex: number, optionIndex: number) => updateGroup(groupIndex, { options: form.optionGroups[groupIndex].options.filter((_, index) => index !== optionIndex) });

  const selectImage = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a PNG, JPG, or WebP image up to 5 MB."); return; }
    try { setUploading(true); setError(""); update("imageUrl", await uploadMenuItemImage(file)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to upload image."); }
    finally { setUploading(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const incompleteGroup = form.optionGroups.some((group) => !group.name.trim() || group.options.length === 0 || group.options.some((option) => !option.name.trim()));
    if (incompleteGroup) { setError("Every option group needs a name and at least one named option."); return; }
    try { setSaving(true); setError(""); if (id) await menuItemsApi.update(Number(id), form); else await menuItemsApi.create(form); navigate("/menu"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save menu item."); }
    finally { setSaving(false); }
  };

  const allOptions = form.optionGroups.flatMap((group) => group.options.map((option) => ({ ...option, groupName: group.name })));
  const previewOption = allOptions[selectedPreviewOption];

  return <section className="menu-item-page">
    <div className="menu-item-heading"><div className="breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><Link to="/menu">Menu</Link><span>/</span><strong>{id ? "Edit Menu Item" : "Add Menu Item"}</strong></div><h1>{id ? "Edit Menu Item" : "Add New Menu Item"}</h1><p>Create a menu item and configure its options.</p></div>
    <form className="menu-item-form" onSubmit={submit}>
      <div className="menu-item-top-grid">
        <section className="menu-panel basic-panel"><h2>Basic Information</h2>
          <label>Item Code <b>*</b><input required value={form.code} onChange={(event) => update("code", event.target.value)} /></label>
          <label>Item Name <b>*</b><input required value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label>Category <b>*</b><select required value={form.categoryId} onChange={(event) => update("categoryId", Number(event.target.value))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="wide-field">Description <b>*</b><textarea required value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
          <label>Price <b>*</b><input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", Number(event.target.value))} /></label>
          <label>Status<select value={form.status} onChange={(event) => update("status", event.target.value as MenuItemUpsert["status"])}><option>Active</option><option>Inactive</option></select></label>
          <label>Dietary Type<select value={form.dietaryType} onChange={(event) => update("dietaryType", event.target.value as MenuItemUpsert["dietaryType"])}><option>Veg</option><option>Non-Veg</option></select></label>
        </section>
        <section className="menu-panel image-panel"><h2>Item Image</h2>
          <button type="button" className="menu-upload" onClick={() => fileInputRef.current?.click()} disabled={uploading}><span>▣</span><strong>{uploading ? "Uploading image..." : "Click to upload an image"}</strong><small>PNG, JPG, WebP · Max. 5 MB</small></button>
          <input ref={fileInputRef} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectImage(event.target.files?.[0])} />
          {form.imageUrl && <div className="menu-image-preview"><img src={form.imageUrl} alt={form.name || "Menu item"} /><button type="button" onClick={() => update("imageUrl", "")}>Remove</button></div>}
        </section>
        <section className="menu-panel additional-panel"><h2>Additional Details</h2><div className="two-fields"><label>Preparation Time (minutes)<input type="number" min="0" value={form.preparationTimeMinutes} onChange={(event) => update("preparationTimeMinutes", Number(event.target.value))} /></label><label>Calories<input type="number" min="0" value={form.calories ?? ""} onChange={(event) => update("calories", event.target.value ? Number(event.target.value) : undefined)} /></label></div><label>Ingredients<textarea value={form.ingredients ?? ""} onChange={(event) => update("ingredients", event.target.value)} /></label><label>Tags<input value={form.tags ?? ""} onChange={(event) => update("tags", event.target.value)} placeholder="Comma-separated tags" /></label></section>
      </div>
      <div className="menu-item-bottom-grid">
        <section className="menu-panel options-panel"><div className="panel-title-row"><h2>Item Options</h2><p>Add variations such as size, portion, or custom choices.</p></div>
          {form.optionGroups.map((group, groupIndex) => <div className="option-group" key={`${group.id ?? "new"}-${groupIndex}`}><div className="option-group-header"><strong>{group.name || "Untitled option group"}</strong><span>{group.isRequired ? "Required" : "Optional"}</span><div><button type="button" title="Remove option group" onClick={() => removeGroup(groupIndex)}>🗑</button></div></div><div className="option-fields"><label>Option Group Name<input required value={group.name} onChange={(event) => updateGroup(groupIndex, { name: event.target.value })} /></label><label>Selection<select value={group.isRequired ? "required" : "optional"} onChange={(event) => updateGroup(groupIndex, { isRequired: event.target.value === "required" })}><option value="optional">Optional</option><option value="required">Required</option></select></label></div><small>Options</small>{group.options.map((option, optionIndex) => <div className="option-row" key={`${option.id ?? "new"}-${optionIndex}`}><span>⠿</span><input required aria-label="Option name" value={option.name} onChange={(event) => updateOption(groupIndex, optionIndex, { name: event.target.value })} /><input required aria-label="Extra price" type="number" min="0" step="0.01" value={option.priceAdjustment} onChange={(event) => updateOption(groupIndex, optionIndex, { priceAdjustment: Number(event.target.value) })} /><button type="button" className="remove-option" title="Remove option" disabled={group.options.length === 1} onClick={() => removeOption(groupIndex, optionIndex)}>×</button></div>)}<button type="button" className="add-option" onClick={() => addOption(groupIndex)}>＋ Add Option</button></div>)}
          <button type="button" className="add-group" onClick={addGroup}>＋ Add Another Option Group</button>
        </section>
        <aside className="menu-side-column"><section className="menu-panel price-summary"><h2>Price Summary</h2><p><span>Base Price</span><strong>₹ {form.price.toFixed(2)}</strong></p>{allOptions.length === 0 ? <p><span>Add an option to see its price</span></p> : allOptions.map((option, index) => <p key={`${option.groupName}-${option.name}-${index}`}><span>{option.groupName}: {option.name}</span><strong>₹ {(form.price + option.priceAdjustment).toFixed(2)} <em>+₹ {option.priceAdjustment.toFixed(2)}</em></strong></p>)}</section><section className="menu-panel item-preview"><h2>Menu Item Preview</h2><div className="preview-tabs">{allOptions.map((option, index) => <button type="button" key={`${option.groupName}-${option.name}-${index}`} className={index === selectedPreviewOption ? "selected" : ""} onClick={() => setSelectedPreviewOption(index)}>{option.name}</button>)}</div><div className="preview-content">{form.imageUrl ? <img src={form.imageUrl} alt="Preview" /> : <div className="preview-image-empty">No image</div>}<div><strong>{form.name || "Your menu item"}</strong><p>{form.description || "Add a description to preview your menu item."}</p><b>₹ {(form.price + (previewOption?.priceAdjustment ?? 0)).toFixed(2)}</b><span>{previewOption ? `${previewOption.groupName}: ${previewOption.name}` : "Base item"}</span><small>{form.preparationTimeMinutes || 0} min {form.calories ? ` · ${form.calories} kcal` : ""}</small></div></div></section></aside>
      </div>
      {error && <p role="alert" className="menu-form-error">{error}</p>}
      <div className="menu-form-actions"><button type="button" onClick={() => navigate(-1)}>Cancel</button><button className="primary-button" disabled={saving || uploading} type="submit">{saving ? "Saving..." : "Save Menu Item"}</button></div>
    </form>
  </section>;
}

export default AddMenuItemPage;
