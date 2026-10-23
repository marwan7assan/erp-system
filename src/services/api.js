import { API_BASE_URL } from "../config/dataSource";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed.");
  return payload;
}

export const authApi = {
  session: () => request("/auth/session"),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (name, email, password) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email, code, password) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    }),
  changePassword: (currentPassword, newPassword) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

/**
 * Generic CRUD Resource API Helper
 */
function createResourceApi(endpoint) {
  return {
    list: (params) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : "";
      return request(`${endpoint}${query}`);
    },
    get: (id) => request(`${endpoint}/${id}`),
    create: (data) =>
      request(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`${endpoint}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id) =>
      request(`${endpoint}/${id}`, {
        method: "DELETE",
      }),
  };
}

export const customersApi = createResourceApi("/customers");
export const suppliersApi = createResourceApi("/suppliers");
export const employeesApi = createResourceApi("/employees");
export const salesApi = createResourceApi("/sales");
export const purchasesApi = createResourceApi("/purchases");
export const inventoryApi = createResourceApi("/inventory");
export const transactionsApi = createResourceApi("/transactions");
