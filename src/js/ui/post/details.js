import { fetchJson } from "/src/js/api/client.js";

// --- Auth guard ---
const token  = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";

const myName = (localStorage.getItem("jsocial_name") || "").toLowerCase();

const postEl   = document.querySelector("#post");
const actions  = document.querySelector("#postActions");

const id = new URLSearchParams(location.search).get("id");
if (!id) {
  postEl.innerHTML = "<p>Missing post ID</p>";
} else {
  loadPost();
}

/**
 * Fetch and render a single post by id.
 * If the post belongs to the logged-in user, show Edit/Delete actions.
 */
async function loadPost() {
  postEl.innerHTML = "<p>Loading…</p>";
  actions && (actions.innerHTML = "");

  try {
    const resp = await fetchJson(`/social/posts/${id}?_author=true`);
    const p = resp?.data;
    if (!p) {
      postEl.innerHTML = "<p>Post not found</p>";
      return;
    }

    const title  = esc(p.title || "(untitled)");
    const body   = esc(p.body || "");
    const author = p.author?.name || "unknown";
    const when   = fmt(p.created || p.updated);
    const mine   = (author || "").toLowerCase() === myName;

    postEl.innerHTML = `
      <h2 class="h4 mb-1">${title}</h2>
      <small class="text-muted">
        by <a href="/profile/index.html?name=${encodeURIComponent(author)}">${esc(author)}</a> • ${when}
      </small>
      ${body ? `<p class="mt-3 mb-0">${body}</p>` : ""}
    `;

    if (mine && actions) {
      actions.innerHTML = `
        <a class="btn btn-primary" href="/post/edit/index.html?id=${p.id}">Edit</a>
        <button id="deleteBtn" class="btn btn-outline-danger">Delete</button>
      `;
      document.querySelector("#deleteBtn")?.addEventListener("click", onDelete);
    }
  } catch (err) {
    console.error(err);
    postEl.innerHTML = `<p>${err?.data?.errors?.[0]?.message || "Failed to load post"}</p>`;
  }
}

async function onDelete() {
  if (!confirm("Delete this post?")) return;
  try {
    await fetchJson(`/social/posts/${id}`, { method: "DELETE" });
    location.href = "/post/index.html";
  } catch (e) {
    console.error(e);
    alert(e?.data?.errors?.[0]?.message || "Failed to delete post");
  }
}

function esc(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
function fmt(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return ""; }
}
