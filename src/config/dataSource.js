// Keep mock mode as the default until the backend is ready.
export const USE_API = import.meta.env.VITE_USE_API === "true";
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
