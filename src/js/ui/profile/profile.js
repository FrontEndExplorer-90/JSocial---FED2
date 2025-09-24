import { fetchJson } from "/src/js/api/client.js";

// --- Auth guard ---
const token  = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";

// who am I?
const myName = localStorage.getItem("jsocial_name") || "";

// which profile to show: ?name=OtherUser or me
const params = new URLSearchParams(location.search);
const viewedName = params.get("name") || myName;

// DOM
const title = document.querySelector("#title");
const info  = document.querySelector("#info");
const posts = document.querySelector("#posts");
const followBtn   = document.querySelector("#followBtn");
const unfollowBtn = document.querySelector("#unfollowBtn");

/**
 * Escape HTML entities to prevent XSS in profile content.
 * @param {string} [s=""] - Input string to escape.
 * @returns {string} Escaped string safe for innerHTML.
 */
const esc = (s = "") =>
  s.replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

/**
 * Load a profile (for `viewedName`) and render header + posts list.
 * Includes followers/following so we can show counts and follow state.
 * @returns {Promise<void>} Resolves when profile is rendered or fails.
 */
async function loadProfile() {
  title.textContent = "Loading…";
  posts.innerHTML = "";

  try {
    const r = await fetchJson(
      `/social/profiles/${encodeURIComponent(viewedName)}?_posts=true&_followers=true&_following=true`
    );
    const p = r?.data;
    if (!p) throw new Error("Profile not found");

    // Header
    title.textContent = p.name;
    const avatar = p.avatar?.url
      ? `<img src="${esc(p.avatar.url)}" alt="avatar" width="80" height="80" style="border-radius:50%;vertical-align:middle;margin-right:.5rem;">`
      : "";

    info.innerHTML = `
      <div>${avatar}<strong>${esc(p.name)}</strong></div>
      <small>Followers: ${p._count?.followers ?? 0} • Following: ${p._count?.following ?? 0}</small>
    `;

    // Posts (clickable -> single post page)
    const userPosts = p.posts ?? [];
    posts.innerHTML = userPosts.length
      ? userPosts.map(x => `
          <li style="margin:.5rem 0">
            <a href="/post/details/index.html?id=${x.id}">
              ${esc(x.title || "(untitled)")}
            </a>
            ${x.created ? `<small> • ${new Date(x.created).toLocaleDateString()}</small>` : ""}
          </li>
        `).join("")
      : "<li>No posts yet</li>";

    // Follow / Unfollow visibility
    if (viewedName !== myName) {
      const iFollow = !!(p.followers || []).find(f => f.name === myName);
      followBtn.hidden   = iFollow;
      unfollowBtn.hidden = !iFollow;
    } else {
      followBtn.hidden = true;
      unfollowBtn.hidden = true;
    }
  } catch (e) {
    console.error(e);
    title.textContent = "Failed to load profile";
    info.textContent  = e?.data?.errors?.[0]?.message || e.message || "";
    posts.innerHTML   = "";
  }
}

/**
 * Event handler: follow the viewed profile, then reload it.
 * @returns {Promise<void>}
 */
followBtn?.addEventListener("click", async () => {
  try {
    await fetchJson(`/social/profiles/${encodeURIComponent(viewedName)}/follow`, { method: "PUT" });
    await loadProfile();
  } catch (e) {
    alert(e?.data?.errors?.[0]?.message || "Failed to follow");
  }
});

unfollowBtn?.addEventListener("click", async () => {
  try {
    await fetchJson(`/social/profiles/${encodeURIComponent(viewedName)}/unfollow`, { method: "PUT" });
    await loadProfile();
  } catch (e) {
    alert(e?.data?.errors?.[0]?.message || "Failed to unfollow");
  }
});

loadProfile();
