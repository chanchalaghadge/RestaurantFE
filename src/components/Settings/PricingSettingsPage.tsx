import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Breadcrumb from "../common/Breadcrumb";
import ErrorAlert from "../common/ErrorAlert";
import { pricingSettingsApi, type PricingSettings } from "../../api/pricing-settings.api";
import { useToast } from "../common/Toast";
import "./PricingSettingsPage.css";

const defaults: PricingSettings = { discountPercent: 0, cgstPercent: 2.5, sgstPercent: 2.5 };

function PricingSettingsPage() {
  const role = (JSON.parse(localStorage.getItem("restaurant-user") || "{}") as { role?: string }).role;
  const canManagePricing = role === "RestaurantOwner" || role === "BranchManager";
  const [settings, setSettings] = useState(defaults);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!canManagePricing) return;
    pricingSettingsApi.get().then(setSettings).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to load pricing settings.");
    });
  }, [canManagePricing]);

  if (!canManagePricing) return <Navigate to="/dashboard" replace />;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      setSettings(await pricingSettingsApi.update(settings));
      showToast("Pricing settings saved", "success");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save pricing settings.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof PricingSettings, value: string) => {
    const numberValue = Number(value);
    setSettings((current) => ({ ...current, [key]: Number.isFinite(numberValue) ? numberValue : 0 }));
  };

  return <section className="pricing-settings-page">
    <Breadcrumb items={[{ label: "Home", path: "/dashboard" }, { label: "Settings", path: "/settings" }, { label: "Order Pricing" }]} />
    <header><div><h1>Order Pricing</h1><p>Set the discount and GST rates applied to new and updated orders.</p></div></header>
    {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}
    <form className="pricing-settings-card" onSubmit={(event) => void save(event)}>
      <label>Discount (%)<input type="number" min="0" max="100" step="0.01" value={settings.discountPercent} onChange={(event) => update("discountPercent", event.target.value)} required /></label>
      <label>CGST (%)<input type="number" min="0" max="100" step="0.01" value={settings.cgstPercent} onChange={(event) => update("cgstPercent", event.target.value)} required /></label>
      <label>SGST (%)<input type="number" min="0" max="100" step="0.01" value={settings.sgstPercent} onChange={(event) => update("sgstPercent", event.target.value)} required /></label>
      <p className="pricing-settings-note">These rates are stored for the active branch and applied when an order is created or edited.</p>
      <div className="pricing-settings-actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button></div>
    </form>
  </section>;
}

export default PricingSettingsPage;
