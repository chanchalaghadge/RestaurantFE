/**
 * Global search utilities
 * Provides cross-component search functionality
 */

export interface SearchResult {
  id: string;
  type: 'category' | 'customer' | 'menuItem' | 'order';
  title: string;
  subtitle?: string;
  url: string;
  icon: string;
}

/**
 * Search across multiple data sources
 */
export function searchAcrossSources(
  query: string,
  sources: {
    categories?: any[];
    customers?: any[];
    menuItems?: any[];
    orders?: any[];
  }
): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Search categories
  if (sources.categories) {
    sources.categories.forEach((category) => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: String(category.id),
          type: 'category',
          title: category.name,
          subtitle: category.description || 'Category',
          url: `/categories/${category.id}`,
          icon: '▣'
        });
      }
    });
  }

  // Search customers
  if (sources.customers) {
    sources.customers.forEach((customer) => {
      const searchableText = `${customer.fullName} ${customer.phone} ${customer.email}`.toLowerCase();
      if (searchableText.includes(lowerQuery)) {
        results.push({
          id: String(customer.id),
          type: 'customer',
          title: customer.fullName,
          subtitle: customer.email || customer.phone,
          url: `/customers/${customer.id}`,
          icon: '♟'
        });
      }
    });
  }

  // Search menu items
  if (sources.menuItems) {
    sources.menuItems.forEach((item) => {
      const searchableText = `${item.name} ${item.code} ${item.category} ${item.description || ''}`.toLowerCase();
      if (searchableText.includes(lowerQuery)) {
        results.push({
          id: String(item.id),
          type: 'menuItem',
          title: item.name,
          subtitle: `${item.category} • ₹${item.price}`,
          url: `/menu/${item.id}/edit`,
          icon: '🍽'
        });
      }
    });
  }

  // Search orders
  if (sources.orders) {
    sources.orders.forEach((order) => {
      const searchableText = `${order.id} ${order.customerName} ${order.tableNumber || ''}`.toLowerCase();
      if (searchableText.includes(lowerQuery)) {
        results.push({
          id: String(order.id),
          type: 'order',
          title: `Order #${order.id}`,
          subtitle: `${order.customerName} • ₹${order.totalAmount.toFixed(2)}`,
          url: `/orders`,
          icon: '▤'
        });
      }
    });
  }

  return results.slice(0, 10); // Limit to 10 results
}

/**
 * Get search result type label
 */
export function getResultTypeLabel(type: SearchResult['type']): string {
  const labels = {
    category: 'Category',
    customer: 'Customer',
    menuItem: 'Menu Item',
    order: 'Order'
  };
  return labels[type];
}