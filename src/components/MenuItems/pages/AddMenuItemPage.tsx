import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "../../Categories/data/category.data";
import type { MenuItemStatus } from "../../../types/menu/menu-item.types";
import "../MenuItems.css";

const biryaniImage = "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=420&h=320&fit=crop";
type EditableOption = { name: string; amount: string };
type EditableOptionGroup = { name: string; required: boolean; options: EditableOption[] };

function AddMenuItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("Chicken Biryani");
  const [category, setCategory] = useState("Biryani");
  const [description, setDescription] = useState("Aromatic basmati rice cooked with tender chicken, traditional spices and herbs.");
  const [price, setPrice] = useState("180.00");
  const [status, setStatus] = useState<MenuItemStatus>("Active");
  const [prepTime, setPrepTime] = useState("20");
  const [calories, setCalories] = useState("450");
  const [ingredients, setIngredients] = useState("Chicken, basmati rice, onion, tomato, yogurt, spices, herbs.");
  const [image, setImage] = useState(biryaniImage);
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [optionGroups, setOptionGroups] = useState<EditableOptionGroup[]>([
    { name: "Rice Portion (Half / Full)", required: true, options: [{ name: "Half", amount: "0.00" }, { name: "Full", amount: "40.00" }] },
    { name: "Cold Drink Size", required: false, options: [{ name: "200 ml", amount: "0.00" }, { name: "300 ml", amount: "20.00" }] },
  ]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const addOptionGroup = () => setOptionGroups((current) => [...current, { name: `New Option Group ${current.length + 1}`, required: false, options: [{ name: "New option", amount: "0.00" }] }]);
  const removeOptionGroup = (groupIndex: number) => setOptionGroups((current) => current.filter((_, index) => index !== groupIndex));
  const addOption = (groupIndex: number) => setOptionGroups((current) => current.map((group, index) => index === groupIndex ? { ...group, options: [...group.options, { name: "New option", amount: "0.00" }] } : group));
  const updateOption = (groupIndex: number, optionIndex: number, field: keyof EditableOption, value: string) => setOptionGroups((current) => current.map((group, index) => index === groupIndex ? { ...group, options: group.options.map((option, optionPosition) => optionPosition === optionIndex ? { ...option, [field]: value } : option) } : group));
  const basePrice = Number(price) || 0;
  return <section className="menu-item-page">
    <div className="menu-item-heading"><div><div className="breadcrumb"><Link to="/dashboard">Home</Link><span>/</span><Link to="/menu">Menu</Link><span>/</span><strong>Add Menu Item</strong></div><h1>Add New Menu Item</h1><p>Create a new menu item and assign it to a category.</p></div></div>
    <form className="menu-item-form" onSubmit={(event) => { event.preventDefault(); navigate("/menu"); }}>
      <div className="menu-item-top-grid">
        <section className="menu-panel basic-panel"><h2>▣ &nbsp; Basic Information</h2><label>Item Name <b>*</b><input required value={name} onChange={(event) => setName(event.target.value)} /><small>{name.length}/100</small></label><label>Category <b>*</b><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Biryani</option>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label className="wide-field">Description <b>*</b><textarea required value={description} onChange={(event) => setDescription(event.target.value)} /><small>{description.length}/500</small></label><div className="price-status"><label>Price <b>*</b><div className="currency-input"><span>₹</span><input required value={price} onChange={(event) => setPrice(event.target.value)} /></div></label><label>Status <b>*</b><div className="status-toggle"><button type="button" className={status === "Active" ? "selected" : ""} onClick={() => setStatus("Active")}>Active</button><button type="button" className={status === "Inactive" ? "inactive-selected" : ""} onClick={() => setStatus("Inactive")}>Inactive</button></div></label></div></section>
        <section className="menu-panel image-panel"><h2>▣ &nbsp; Item Image</h2><button type="button" className="menu-upload" onClick={() => fileInputRef.current?.click()}><span>▣</span><strong>Click to upload or drag and drop</strong><small>Supports: JPG, PNG, WebP (Max. 5MB)</small></button><input ref={fileInputRef} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} /><h3>Preview</h3><div className="menu-image-preview"><img src={image} alt={name} /><button type="button" onClick={() => setImage("")}>▢ Remove</button></div></section>
        <section className="menu-panel additional-panel"><h2>♧ &nbsp; Additional Details</h2><div className="two-fields"><label>Preparation Time (minutes) <b>*</b><input value={prepTime} onChange={(event) => setPrepTime(event.target.value)} /></label><label>Calories (per serving)<input value={calories} onChange={(event) => setCalories(event.target.value)} /></label></div><label>Ingredients<textarea value={ingredients} onChange={(event) => setIngredients(event.target.value)} /></label><label>Tags<input placeholder="Add tags (comma separated)" /></label><div className="tag-list"><span>Biryani ×</span><span>Non-Veg ×</span><span>Spicy ×</span><span>Popular ×</span></div></section>
      </div>
      <div className="menu-item-bottom-grid"><section className="menu-panel options-panel"><div className="panel-title-row"><div><h2>⊙ &nbsp; Item Options</h2><p>Add variations like size, portion, or custom choices (e.g., rice half/full, drink sizes).</p></div></div>{optionGroups.map((group, groupIndex) => { const isEditing = editingGroup === groupIndex; return <div className="option-group" key={`${group.name}-${groupIndex}`}><div className="option-group-header"><strong>▣ &nbsp; {group.name}</strong><span>{group.required ? "Required" : "Optional"}</span><div><button type="button" aria-label={`${isEditing ? "Save" : "Edit"} ${group.name}`} onClick={() => setEditingGroup(isEditing ? null : groupIndex)}>{isEditing ? "✓" : "↗"}</button><button type="button" aria-label={`Remove ${group.name}`} onClick={() => { removeOptionGroup(groupIndex); setEditingGroup(null); }}>♲</button></div></div><div className="option-fields"><label>Option Type<select disabled={!isEditing}><option>Radio Button (Single Select)</option></select></label><label>Option Name<input disabled={!isEditing} value={group.name.replace(" (Half / Full)", "").replace(" Size", "")} onChange={(event) => setOptionGroups((current) => current.map((item, index) => index === groupIndex ? { ...item, name: event.target.value } : item))} /></label></div><small>Options</small>{group.options.map((option, optionIndex) => <div className="option-row" key={`${option.name}-${optionIndex}`}><span>⁙</span><input disabled={!isEditing} className="option-name-input" value={option.name} onChange={(event) => updateOption(groupIndex, optionIndex, "name", event.target.value)} /><label className="option-amount"><span>+ ₹</span><input disabled={!isEditing} value={option.amount} type="number" min="0" step="0.01" onChange={(event) => updateOption(groupIndex, optionIndex, "amount", event.target.value)} /></label><input type="radio" name={`option-${groupIndex}`} defaultChecked={optionIndex === 0} /></div>)}<button className="add-option" type="button" onClick={() => addOption(groupIndex)}>＋ Add Option</button></div>; })}<button className="add-group" type="button" onClick={addOptionGroup}>＋ Add Another Option Group</button></section>
        <aside className="menu-side-column"><section className="menu-panel price-summary"><h2>⊙ &nbsp; Price Summary</h2><p>Base Price <strong>₹ {basePrice.toFixed(2)}</strong></p>{optionGroups.flatMap((group) => group.options).slice(0, 3).map((option, index) => { const amount = Number(option.amount) || 0; return <p key={`${option.name}-${index}`}>{option.name || "Unnamed option"}<strong>₹ {(basePrice + amount).toFixed(2)} <em>+ ₹ {amount.toFixed(2)}</em></strong></p>; })}</section><section className="menu-panel item-preview"><h2>▣ &nbsp; Menu Item Preview</h2><div className="preview-tabs"><button className="selected">{optionGroups[0]?.options[0]?.name || "Default"}</button>{optionGroups[0]?.options.slice(1, 4).map((option) => <button key={option.name}>{option.name}</button>)}</div><div className="preview-content"><img src={image} alt="Preview" /><div><strong>{name}</strong><p>{description}</p><b>₹ {basePrice.toFixed(2)}</b><span>({optionGroups[0]?.options[0]?.name || "Default"})</span><small>◷ {prepTime} min &nbsp; ◉ {calories} kcal</small></div></div></section></aside>
      </div>
      <div className="menu-form-actions"><button type="button" onClick={() => navigate(-1)}>Cancel</button><button className="primary-button" type="submit">▣ &nbsp; Save Menu Item</button></div>
    </form>
  </section>;
}

export default AddMenuItemPage;