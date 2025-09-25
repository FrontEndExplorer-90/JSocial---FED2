// src/js/ui/profile/profile.js
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
const title          = document.querySelector("#title");
const info           = document.querySelector("#info");
const postsEl        = document.querySelector("#posts");
const followersEl    = document.querySelector("#followersList");
const followingEl    = document.querySelector("#followingList");
const followersCount = document.querySelector("#followersCount");
const followingCount = document.querySelector("#followingCount");
const followBtn      = document.querySelector("#followBtn");
const unfollowBtn    = document.querySelector("#unfollowBtn");

const esc = (s = "") =>
  s.replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

/**
 * Render a simple list of users as links to their profiles.
 * @param {Array<{name: string, avatar?: {url?: string}}>} users
 * @param {HTMLElement} container
 */
function renderUserList(users = [], container) {
  if (!users.length) {
    container.innerHTML = `<li class="text-muted">None</li>`;
    return;
  }
  container.innerHTML = users.map(u => {
    const name = u?.name ?? "(unknown)";
    // keep it simple; you could add small avatar circles here if you want
    return `
      <li class="mb-1">
        <a href="/profile/index.html?name=${encodeURIComponent(name)}">${esc(name)}</a>
      </li>
    `;
  }).join("");
}

/**
 * Load a profile (for `viewedName`) and render header + posts + followers/following.
 * Includes followers/following so we can show counts and follow state.
 */
async function loadProfile() {
  title.textContent = "Loading…";
  postsEl.innerHTML = "";
  followersEl.innerHTML = "";
  followingEl.innerHTML = "";
  followersCount.textContent = "";
  followingCount.textContent = "";

  try {
    const r = await fetchJson(
      `/social/profiles/${encodeURIComponent(viewedName)}?_posts=true&_followers=true&_following=true`
    );
    const p = r?.data;
    if (!p) throw new Error("Profile not found");

    // Header
    title.textContent = p.name;
    const avatar = p.avatar?.url
      ? `<img src="${esc(p.avatar.url)}" alt="avatar" width="80" height="80" class="rounded-circle me-2 align-middle">`
      : "";

    info.innerHTML = `
      <div class="d-flex align-items-center mb-1">${avatar}<strong class="fs-5">${esc(p.name)}</strong></div>
      <small class="text-muted">
        Followers: ${p._count?.followers ?? 0} • Following: ${p._count?.following ?? 0}
      </small>
    `;

    // Posts (clickable -> single post page)
    const userPosts = p.posts ?? [];
    postsEl.innerHTML = userPosts.length
      ? userPosts.map(x => `
          <li class="mb-2">
            <a class="text-decoration-none" href="/post/details/index.html?id=${x.id}">
              ${esc(x.title || "(untitled)")}
            </a>
            ${x.created ? `<small class="text-muted"> • ${new Date(x.created).toLocaleDateString()}</small>` : ""}
          </li>
        `).join("")
      : `<li class="text-muted">No posts yet</li>`;

    // Followers & Following lists
    const followers = p.followers ?? [];
    const following = p.following ?? [];
    followersCount.textContent = `(${followers.length})`;
    followingCount.textContent = `(${following.length})`;

    renderUserList(followers, followersEl);
    renderUserList(following, followingEl);

    // Follow / Unfollow visibility
    if (viewedName !== myName) {
      const iFollow = !!followers.find(f => f.name === myName);
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
    postsEl.innerHTML = "";
    followersEl.innerHTML = "";
    followingEl.innerHTML = "";
  }
}

// Follow / Unfollow handlers
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
