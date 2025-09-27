import { fetchJson } from "/src/js/api/client.js";


const token = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";


const myName = (localStorage.getItem("jsocial_name") || "").toLowerCase();


const list = document.querySelector("#feed");
const logoutBtn = document.querySelector("#logout");
const searchInput = document.querySelector("#search");

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("jsocial_token");
  localStorage.removeItem("jsocial_apiKey");
  localStorage.removeItem("jsocial_name");
  location.href = "/auth/login/index.html";
});

/**
 * Makes text safe for use in HTML.
 * @param {string} [s=""] - The string that makes it save.
 * @returns {string} the HTML-safe string.
 */
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

/**
 * makes a date easy to read.
 * @param {string} iso - ISO date string.
 * @returns {string} finds date/time string, or empty string on error.
 */
function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return ""; }
}

// State
let allPosts = [];

/**
 * puts posts into a feed.
 * Adds edit/delete buttons for the logged-in user’s posts.
 * @param {Array<Object>} items - Array of post objects.
 */
function render(items) {
  if (!items.length) {
    list.innerHTML = "<li class='text-muted'>No posts yet.</li>";
    return;
  }

  list.innerHTML = items.map((p) => {
    const title  = escapeHtml(p.title || "(untitled)");
    const body   = escapeHtml(p.body || "");
    const author = p.author?.name || "unknown";
    const when   = formatDate(p.created || p.updated);
    const mine   = (author || "").toLowerCase() === myName;

    return `
      <li class="mb-4" data-id="${p.id}">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">
              <a href="/post/details/index.html?id=${p.id}" class="text-decoration-none">${title}</a>
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
              by <a href="/profile/index.html?name=${encodeURIComponent(author)}">${escapeHtml(author)}</a> • ${when}
            </h6>
            ${body ? `<p class="card-text mt-2">${body}</p>` : ""}
            ${mine ? `
              <div class="mt-3 d-flex gap-2">
                <a href="/post/edit/index.html?id=${p.id}" class="btn btn-sm btn-outline-secondary">Edit</a>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${p.id}">Delete</button>
              </div>
            ` : ""}
          </div>
        </div>
      </li>
    `;
  }).join(""); 


  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm("Delete this post?")) return;
      try {
        await fetchJson(`/social/posts/${id}`, { method: "DELETE" });
        e.currentTarget.closest("li")?.remove();
      } catch (err) {
        console.error(err);
        alert(err?.data?.errors?.[0]?.message || "Failed to delete post");
      }
    });
  });
}


(async () => {
  list.innerHTML = "<li>Loading…</li>";
  try {
    const resp = await fetchJson("/social/posts?_author=true&sort=created&sortOrder=desc");
    allPosts = resp?.data ?? [];
    render(allPosts);
  } catch (err) {
    console.error(err);
    const msg = err?.data?.errors?.[0]?.message || "Failed to load posts";
    list.innerHTML = `<li>${msg}</li>`;
  }
})();


searchInput?.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allPosts.filter((p) =>
    (p.title || "").toLowerCase().includes(q) ||
    (p.body || "").toLowerCase().includes(q) ||
    (p.author?.name || "").toLowerCase().includes(q)
  );
  render(filtered);
});
