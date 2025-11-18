// --- Файл: /client/src/utils/api.js ---

import { auth } from "./firebase.client";

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  try {
    return await user.getIdToken(true);
  } catch (error) {
    console.error("Error getting ID token:", error);
    throw new Error("Could not verify user session.");
  }
}

async function fetchWithAuth(url, opts = {}) {
  let token;
  try {
    token = await getIdToken();
  } catch (error) {
    console.error("Authentication error:", error.message);
    window.location.href = "/login";
    throw error;
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...opts.headers,
  };
  const config = { ...opts, headers };
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  try {
    const response = await fetch(`${API_BASE}${url}`, config);
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        url,
        errorData,
      });
      throw new Error(errorData.error || response.statusText);
    }
    if (response.status === 204) return { success: true };
    return response.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

export async function createUserRecordAPI() {
  return fetchWithAuth(`/api/auth/create-user-record`, { method: "POST" });
}
export async function getInventories() {
  return fetchWithAuth(`/api/inventories`);
}
export async function createInventory(data) {
  return fetchWithAuth(`/api/inventories`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function deleteInventory(inventoryId) {
  return fetchWithAuth(`/api/inventories/${inventoryId}`, { method: "DELETE" });
}
export async function getItems(inventoryId) {
  return fetchWithAuth(`/api/inventories/${inventoryId}`);
}
export async function createItem(inventoryId, data, customId = null) {
  return fetchWithAuth(`/api/items`, {
    method: "POST",
    body: JSON.stringify({ inventoryId, data, customId: customId || null }),
  });
}
export async function updateItem(inventoryId, itemId, data, customId = null) {
  return fetchWithAuth(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ inventoryId, data, customId: customId || null }),
  });
}
export async function deleteItem(inventoryId, itemId) {
  return fetchWithAuth(`/api/items/${itemId}`, {
    method: "DELETE",
    body: JSON.stringify({ inventoryId }),
  });
}
export async function globalSearch(query) {
  if (!query || query.length < 2) return { results: [] };
  return fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}&limit=20`);
}
export async function getAdminUsers(page = 1) {
  return fetchWithAuth(`/api/admin/users?page=${page}&limit=50`);
}
export async function updateAdminUser(uid, data) {
  return fetchWithAuth(`/api/admin/users/${uid}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export async function getAdminInventories() {
  return fetchWithAuth(`/api/admin/inventories`);
}
export async function getAdminStats() {
  return fetchWithAuth(`/api/admin/stats`);
}

export async function updateInventory(inventoryId, data) {
  return fetchWithAuth(`/api/inventories/${inventoryId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function completeSalesforceSync(code, codeVerifier) {
  return fetchWithAuth(`/api/user/salesforce-callback`, {
    method: "POST",
    body: JSON.stringify({ code, codeVerifier }),
  });
}

export async function getSalesforceStatus() {
  return fetchWithAuth(`/api/user/salesforce-status`);
}
