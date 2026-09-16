export type CustomerStatus = "Active" | "Inactive";
export type CustomerTier = "Regular" | "VIP" | "New";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: CustomerStatus;
  tier: CustomerTier;
  totalOrders: number;
  lastOrder: string;
  initials: string;
  avatarTone: "purple" | "blue" | "green" | "orange";
  gender?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
};
