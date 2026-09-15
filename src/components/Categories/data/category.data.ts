import type { Category } from "../../../types/category/category.types";

export const categoryImages = {
  pizza: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=240&h=180&fit=crop",
  burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=240&h=180&fit=crop",
  pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=240&h=180&fit=crop",
  salads: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=240&h=180&fit=crop",
  beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=240&h=180&fit=crop",
  desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=240&h=180&fit=crop",
  appetizers: "https://images.unsplash.com/photo-1547592180-85f173990554?w=240&h=180&fit=crop",
  seafood: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=240&h=180&fit=crop",
};

export const categories: Category[] = [
  { id: "pizza", name: "Pizza", slug: "/pizza", description: "Freshly made pizzas with premium ingredients and authentic flavors.", items: 6, status: "Active", image: categoryImages.pizza },
  { id: "burgers", name: "Burgers", slug: "/burgers", description: "Juicy burgers with fresh vegetables and special sauces.", items: 5, status: "Active", image: categoryImages.burgers },
  { id: "pasta", name: "Pasta", slug: "/pasta", description: "Classic and modern pasta dishes for every taste.", items: 4, status: "Active", image: categoryImages.pasta },
  { id: "salads", name: "Salads", slug: "/salads", description: "Fresh, healthy and delicious salads made with the best ingredients.", items: 3, status: "Active", image: categoryImages.salads },
  { id: "beverages", name: "Beverages", slug: "/beverages", description: "Refreshing drinks, mocktails and classic beverages.", items: 6, status: "Active", image: categoryImages.beverages },
  { id: "desserts", name: "Desserts", slug: "/desserts", description: "Sweet endings to make your meal more special.", items: 4, status: "Active", image: categoryImages.desserts },
  { id: "appetizers", name: "Appetizers", slug: "/appetizers", description: "Perfect starters to kick off your meal.", items: 3, status: "Active", image: categoryImages.appetizers },
  { id: "seafood", name: "Seafood", slug: "/seafood", description: "Fresh seafood cooked with special spices and herbs.", items: 2, status: "Inactive", image: categoryImages.seafood },
];