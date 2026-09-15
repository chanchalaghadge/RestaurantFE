export type CategoryStatus = "Active" | "Inactive";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  items: number;
  status: CategoryStatus;
  image: string;
};