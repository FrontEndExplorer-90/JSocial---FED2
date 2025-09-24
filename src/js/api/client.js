// src/js/api/client.js
const BASE_URL = "https://v2.api.noroff.dev";

export function setAuth({ token, apiKey }) {
  if (token !== undefined) localStorage.setItem("jsocial_token", token || "");
  if (apiKey !== undefined) localStorage.setItem("jsocial_apiKey", apiKey || "");
}

function buildHeaders(extra = {}) {
  const token = localStorage.getItem("jsocial_token");
  const apiKey = localStorage.getItem("jsocial_apiKey");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(apiKey ? { "X-Noroff-API-Key": apiKey } : {}),
    ...extra,
  };
}

export async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error("Request failed"), { status: res.status, data });
  return data; // { data, meta }
}
