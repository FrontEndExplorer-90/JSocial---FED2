import { fetchJson } from "/src/js/api/client.js";

// Auth guard
const token = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";

// Grab post id from ?id=123
const id = new URLSearchParams(location.search).get("id");
const container = document.querySelector("#post");

if (!id) {
  container.innerHTML = "<p>Missing post ID</p>";
} else {
  loadPost();
}

/**
 * Fetch and render a single post by id.
 */
async function loadPost() {
  container.innerHTML = "<p>Loading…</p>";
  try {
    const resp = await fetchJson(`/social/posts/${id}?_author=true`);
    const p = resp?.data;

    if (!p) {
      container.innerHTML = "<p>Post not found</p>";
      return;
    }

    const title  = p.title || "(untitled)";
    const body   = p.body || "";
    const author = p.author?.name || "unknown";
    const when   = new Date(p.created || p.updated).toLocaleString();

    container.innerHTML = `
      <h2>${title}</h2>
      <small>by <a href="/profile/index.html?name=${encodeURIComponent(author)}">${author}</a> • ${when}</small>
      ${body ? `<p>${body}</p>` : ""}
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>${err?.data?.errors?.[0]?.message || "Failed to load post"}</p>`;
  }
}
