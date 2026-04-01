/**
 * Authentication utility functions for managing user session
 */

const USER_KEY = "stayvista-user";

export const getLoggedInUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setLoggedInUser = (user: { id?: number; end_user_id?: number; name: string; email: string } | null) => {
  if (user) {
    // Normalize user object: use end_user_id as id if id is not provided
    const normalizedUser = {
      id: user.id || user.end_user_id,
      name: user.name,
      email: user.email,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  window.dispatchEvent(new Event("stayvista-auth-change"));
};
