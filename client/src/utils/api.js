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
    window.location.href = '/login'; 
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
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        url,
        errorData,
      });
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
       return await response.json();
    } else {
       return { ok: true }; 
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function createUserRecordAPI() {
  const user = auth.currentUser;
  if (!user || !user.email) {
     console.error("User not available or email missing for createUserRecordAPI");
     throw new Error("User data incomplete for creating record.");
  }
  return fetchWithAuth(`/api/auth/create-user-record`, { 
    method: "POST",
    body: JSON.stringify({ uid: user.uid, email: user.email }),
  });
}

export async function getInventories() {
  return fetchWithAuth(`/api/inventories`);
}

export async function createInventory(payload) {
  return fetchWithAuth(`/api/inventories`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteInventory(inventoryId) {
    return fetchWithAuth(`/api/inventories/${inventoryId}`, {
        method: 'DELETE',
    });
}


export async function getItems(inventoryId) {
  return fetchWithAuth(`/api/items?inventoryId=${inventoryId}`);
}

export async function createItem(inventoryId, data) {
  return fetchWithAuth(`/api/items`, {
    method: "POST",
    body: JSON.stringify({ inventoryId, data }),
  });
}

export async function updateItem(inventoryId, itemId, data) {
  return fetchWithAuth(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ inventoryId, data }),
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
  return fetchWithAuth(
    `/api/search?q=${encodeURIComponent(query)}&limit=20`
  );
}

export async function getAdminUsers() {
  return fetchWithAuth(`/api/admin/users`);
}

export async function updateAdminUser(uid, data) {
  return fetchWithAuth(`/api/admin/users/${uid}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}