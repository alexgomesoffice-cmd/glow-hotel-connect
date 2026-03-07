/**
 * API Utility Functions
 * 
 * Centralized API configuration and helper functions
 * All API calls should use these utilities to ensure consistent:
 * - Base URL
 * - Headers
 * - Authentication tokens
 * - Error handling
 */

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Get authorization headers with token if available
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
}

/**
 * Make an authenticated API request
 * 
 * @example
 * const data = await apiRequest("POST", "/auth/end-user/login", { email, password });
 * const user = await apiRequest("GET", "/profiles/end-user/1");
 */
export async function apiRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
  endpoint: string,
  body?: Record<string, unknown>
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
  };

  if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Check if token is invalid (401 Unauthorized)
    if (response.status === 401) {
      // Clear stored credentials
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      
      // Redirect to login (you can use navigate in component instead)
      window.location.href = "/login";
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Helper for GET requests
 */
export function apiGet(endpoint: string) {
  return apiRequest("GET", endpoint);
}

/**
 * Helper for POST requests
 */
export function apiPost(endpoint: string, body: Record<string, unknown>) {
  return apiRequest("POST", endpoint, body);
}

/**
 * Helper for PATCH requests
 */
export function apiPatch(endpoint: string, body: Record<string, unknown>) {
  return apiRequest("PATCH", endpoint, body);
}

/**
 * Helper for DELETE requests
 */
export function apiDelete(endpoint: string) {
  return apiRequest("DELETE", endpoint);
}

/**
 * Logout - clear credentials and redirect
 */
export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("hotelId");
  window.location.href = "/login";
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("authToken");
}

/**
 * Get current user role
 */
export function getUserRole(): string | null {
  return localStorage.getItem("userRole");
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}
