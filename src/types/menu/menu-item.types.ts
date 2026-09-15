export type MenuItemStatus = "Active" | "Inactive";

export type MenuItemOption = {
  name: string;
  price: number;
};

export type MenuItem = {
  name: string;
  category: string;
  description: string;
  price: number;
  preparationTime: number;
  calories: number;
  ingredients: string;
  status: MenuItemStatus;
  image: string;
};