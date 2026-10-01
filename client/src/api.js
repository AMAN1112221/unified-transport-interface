const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/${path.replace(/^\/+/, "")}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error("Unable to connect to the server");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.assign("/login");
    }
    throw new Error(data.message || "The request could not be completed");
  }
  return data;
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getDirectionsUrl(pickup, delivery) {
  const params = new URLSearchParams({
    api: "1",
    origin: pickup || "",
    destination: delivery || ""
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function endSession() {
  try {
    await apiRequest("auth/logout", { method: "POST" });
  } catch {
    clearSession();
    window.location.replace("/login");
    return;
  }
  clearSession();
  window.location.replace("/login");
}