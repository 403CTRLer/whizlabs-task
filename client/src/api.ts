const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

/**
 * API Client
 * Handles all HTTP requests to the back-end API
 */
async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error || res.statusText);
  }
  return res.json().catch(() => null);
}

export const api = {
  // Item CRUD operations
  listItems: (search?: string, category?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (page) params.append("page", String(page));
    if (limit) params.append("limit", String(limit));
    const query = params.toString();
    return request(`/items${query ? `?${query}` : ""}`);
  },
  getItem: (id: string) => request(`/items/${id}`),
  createItem: (data: any) => request(`/items`, { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id: string, data: any) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id: string) => fetch(`${API_BASE}/items/${id}`, { method: "DELETE" }),
  
  // Analytics
  getStats: () => request(`/items/stats`),
  
  // Categories
  getCategories: () => request(`/items/categories`),
  
  // AI Features
  generateDescription: (itemName: string, category: string) => 
    request(`/items/generate-description`, { 
      method: "POST", 
      body: JSON.stringify({ itemName, category }) 
    }),
};
