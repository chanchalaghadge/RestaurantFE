import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Customer, CustomerTier } from "../../../types/customer/customer.types";

type CustomerFormProps = {
  customer?: Partial<Customer>;
  mode: "create" | "edit";
};

const defaultCustomer: Partial<Customer> = {
  name: "",
  phone: "",
  email: "",
  status: "Active",
  tier: "Regular",
  totalOrders: 0,
  lastOrder: "No order yet",
  gender: "Male",
  address: "",
  dateOfBirth: "",
  notes: "",
};

function CustomerForm({ customer, mode }: CustomerFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Customer>>({
    ...defaultCustomer,
    ...customer,
  });

  const handleChange = <K extends keyof Partial<Customer>>(field: K, value: Partial<Customer>[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/customers");
  };

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      <div className="customer-form-grid">
        <label className="field-group">
          <span>Full Name</span>
          <input
            value={form.name ?? ""}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Enter customer name"
          />
        </label>

        <label className="field-group">
          <span>Customer Type</span>
          <select
            value={form.tier ?? "Regular"}
            onChange={(event) => handleChange("tier", event.target.value as CustomerTier)}
          >
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="New">New</option>
          </select>
        </label>

        <label className="field-group">
          <span>Phone Number</span>
          <input
            value={form.phone ?? ""}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="field-group">
          <span>Gender</span>
          <select
            value={form.gender ?? "Male"}
            onChange={(event) => handleChange("gender", event.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="field-group">
          <span>Email</span>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="customer@example.com"
          />
        </label>

        <label className="field-group">
          <span>Address</span>
          <input
            value={form.address ?? ""}
            onChange={(event) => handleChange("address", event.target.value)}
            placeholder="Enter complete address"
          />
        </label>

        <label className="field-group">
          <span>Date of Birth</span>
          <input
            type="date"
            value={form.dateOfBirth ?? ""}
            onChange={(event) => handleChange("dateOfBirth", event.target.value)}
          />
        </label>

        <label className="field-group full-width">
          <span>Notes</span>
          <textarea
            value={form.notes ?? ""}
            onChange={(event) => handleChange("notes", event.target.value)}
            placeholder="Any additional notes..."
          />
        </label>
      </div>

      <div className="customer-form-actions">
        <button className="secondary-button" type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          {mode === "create" ? "Save Customer" : "Update Customer"}
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;
