export type MenuItemStatus = "Active" | "Inactive";
export type DietaryType = "Veg" | "Non-Veg";

export type MenuItemOption = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  preparationTime: number;
  calories: number;
  ingredients: string;
  status: MenuItemStatus;
  dietary: DietaryType;
  image: string;
};