import { api } from "./client";

export type PricingSettings = {
  discountPercent: number;
  cgstPercent: number;
  sgstPercent: number;
};

export const pricingSettingsApi = {
  get: () => api<PricingSettings>("/api/pricing-settings"),
  update: (settings: PricingSettings) => api<PricingSettings>("/api/pricing-settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  }),
};
