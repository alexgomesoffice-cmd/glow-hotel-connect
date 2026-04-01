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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

  if (body !== undefined && body !== null && (method === "POST" || method === "PATCH" || method === "PUT")) {
    // even if body is an empty object or array we stringify it
    options.body = JSON.stringify(body);
  } else {
    // no body being sent; remove content-type header so express.json won't try parsing
    if (options.headers && options.headers["Content-Type"]) {
      delete options.headers["Content-Type"];
    }
  }

  try {
    // debug: log outgoing body to help diagnose parsing errors
    if (options.body !== undefined) {
      console.debug("API Request Body", options.body);
    }

    const response = await fetch(url, options);

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error(`API Response JSON parse error [${method} ${endpoint}] text=`, text);
      throw new Error(`API JSON parse error: ${parseError instanceof Error ? parseError.message : "Unknown"}`);
    }

    if (!response.ok) {
      const message = (data && (data.message || data.error?.message)) || `API request failed with status ${response.status}`;
      // Log full error details for debugging
      if (data?.error?.details) {
        console.error(`API Validation Error Details [${method} ${endpoint}]:`, data.error.details);
      }
      console.error(`Full Error Response [${method} ${endpoint}]:`, JSON.stringify(data, null, 2));
      throw new Error(message);
    }

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
 * Helper for POST requests with FormData (for file uploads)
 */
export async function apiPostFormData(endpoint: string, formData: FormData) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("authToken");

  const options: RequestInit = {
    method: "POST",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    body: formData,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const message = (data && (data.message || data.error?.message)) || `API request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [POST ${endpoint}]:`, error);
    throw error;
  }
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
 * Helper for PUT requests
 */
export function apiPut(endpoint: string, body: Record<string, unknown>) {
  return apiRequest("PUT", endpoint, body);
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

/**
 * Convert relative image URL to absolute URL
 * 
 * @example
 * getImageUrl("Cities/dhaka.png") => "http://localhost:3000/Cities/dhaka.png"
 * getImageUrl("https://example.com/image.jpg") => "https://example.com/image.jpg" (unchanged)
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  
  // Remove /api from base URL to get the server base URL
  const serverBaseUrl = API_BASE_URL.replace("/api", "");
  
  // Prepend server base URL to relative paths
  return `${serverBaseUrl}/${imageUrl}`;
}
