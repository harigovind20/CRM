const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the API. Is the server running?");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: (resource, params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== "All")).toString();
    return request(`/${resource}${qs ? "?" + qs : ""}`);
  },
  create: (resource, body) => request(`/${resource}`, { method: "POST", body }),
  update: (resource, id, body) => request(`/${resource}/${id}`, { method: "PATCH", body }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: "DELETE" }),
  stats: () => request("/stats"),
};
