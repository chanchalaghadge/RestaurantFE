import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customersApi, type CustomerApi, type CustomerUpsert } from "../../../api/customers.api";
import { validateEmail, validatePhone, validateRequired } from "../../../utils/validation";
import { useToast } from "../../common/Toast";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";

function CustomerForm({ customer, mode }: { customer?: CustomerApi; mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<CustomerUpsert>({ fullName: customer?.fullName ?? "", phone: customer?.phone ?? "", email: customer?.email ?? "", status: customer?.status ?? "Active", tier: customer?.tier ?? "Regular", gender: customer?.gender ?? "Male", address: customer?.address ?? "", dateOfBirth: customer?.dateOfBirth?.slice(0, 10) ?? "", notes: customer?.notes ?? "" });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useUnsavedChanges(hasUnsavedChanges);
  const update = <K extends keyof CustomerUpsert>(key: K, value: CustomerUpsert[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[key as string]) {
      setFieldErrors((previous) => ({
        ...previous,
        [key]: ''
      }));
    }
  };
  const submit = async (event: React.FormEvent) => { 
    event.preventDefault();
    
    // Validate form fields
    const errors: Record<string, string> = {};
    
    const nameResult = validateRequired(form.fullName, 'Full name');
    if (!nameResult.isValid) {
      errors.fullName = nameResult.error;
    }
    
    const phoneResult = validatePhone(form.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
    }
    
    if (form.email) {
      const emailResult = validateEmail(form.email);
      if (!emailResult.isValid) {
        errors.email = emailResult.error;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      customer ? await customersApi.update(customer.id, form) : await customersApi.create(form);
      setHasUnsavedChanges(false);
      showToast(mode === "create" ? "Customer created successfully" : "Customer updated successfully", "success");
      navigate("/customers");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to save customer.";
      showToast(message, "error", 3500);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const initialForm = customer ? {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      status: customer.status,
      tier: customer.tier,
      gender: customer.gender,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth?.slice(0, 10) ?? "",
      notes: customer.notes
    } : {
      fullName: "",
      phone: "",
      email: "",
      status: "Active",
      tier: "Regular",
      gender: "Male",
      address: "",
      dateOfBirth: "",
      notes: ""
    };
    const changed = JSON.stringify(form) !== JSON.stringify(initialForm);
    setHasUnsavedChanges(changed);
  }, [form, customer]);
  return (
    <form className="customer-form" onSubmit={submit}>
      <div className="customer-form-grid">
        <label className="field-group">
          <span>Full Name</span>
          <input 
            required 
            value={form.fullName} 
            onChange={(e) => update("fullName", e.target.value)} 
            aria-invalid={fieldErrors.fullName ? 'true' : 'false'} 
            aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined} 
          />
          {fieldErrors.fullName && <p id="fullName-error" className="field-error" role="alert">{fieldErrors.fullName}</p>}
        </label>
        <label className="field-group">
          <span>Customer Type</span>
          <select value={form.tier} onChange={(e) => update("tier", e.target.value as CustomerUpsert["tier"])}>
            <option>Regular</option>
            <option>VIP</option>
            <option>New</option>
          </select>
        </label>
        <label className="field-group">
          <span>Phone Number</span>
          <input 
            required 
            value={form.phone} 
            onChange={(e) => update("phone", e.target.value)} 
            aria-invalid={fieldErrors.phone ? 'true' : 'false'} 
            aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} 
          />
          {fieldErrors.phone && <p id="phone-error" className="field-error" role="alert">{fieldErrors.phone}</p>}
        </label>
        <label className="field-group">
          <span>Gender</span>
          <select value={form.gender} onChange={(e) => update("gender", e.target.value as CustomerUpsert["gender"])}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label className="field-group">
          <span>Email</span>
          <input 
            type="email" 
            value={form.email} 
            onChange={(e) => update("email", e.target.value)} 
            aria-invalid={fieldErrors.email ? 'true' : 'false'} 
            aria-describedby={fieldErrors.email ? 'email-error' : undefined} 
          />
          {fieldErrors.email && <p id="email-error" className="field-error" role="alert">{fieldErrors.email}</p>}
        </label>
        <label className="field-group">
          <span>Address</span>
          <input value={form.address} onChange={(e) => update("address", e.target.value)} />
        </label>
        <label className="field-group">
          <span>Date of Birth</span>
          <input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
        </label>
        <label className="field-group full-width">
          <span>Notes</span>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </label>
      </div>
      <div className="customer-form-actions">
        <button className="secondary-button" type="button" onClick={() => navigate(-1)}>Cancel</button>
        <button className="primary-button" disabled={saving} type="submit">
          {saving ? "Saving..." : mode === "create" ? "Save Customer" : "Update Customer"}
        </button>
      </div>
    </form>
  );
}
export default CustomerForm;
