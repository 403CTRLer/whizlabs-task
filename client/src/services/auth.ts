const AUTH_TOKEN_KEY = "auth_token";

/**
 * Auth Service
 * Handles authentication token storage and API calls
 */
export const auth = {
  /**
   * Login with email and password
   * Stores token in localStorage on success
   */
  login: async (email: string, password: string) => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }

    const data = await res.json();
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    return data.user;
  },

  /**
   * Logout - remove token from storage
   */
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get current token from storage
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

