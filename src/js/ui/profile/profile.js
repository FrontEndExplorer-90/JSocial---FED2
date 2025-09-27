import { fetchJson } from "/src/js/api/client.js";

const token  = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";

const myName = localStorage.getItem("jsocial_name") || "";

const params = new URLSearchParams(location.search);
const viewedName = params.get("name") || myName;

const title          = document.querySelector("#title");
const info           = document.querySelector("#info");
const postsEl        = document.querySelector("#posts");
const followersEl    = document.querySelector("#followersList");
const followingEl    = document.querySelector("#followingList");
const followersCount = document.querySelector("#followersCount");
const followingCount = document.querySelector("#followingCount");
const followBtn      = document.querySelector("#followBtn");
const unfollowBtn    = document.querySelector("#unfollowBtn");

/**
 * makes text for html.
 * @param {string} [s=""]
 * @returns {string}
 */
function esc(s = "") {
  return s.replace(/[&<>"']/g, (m) => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[m]
  ));
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ""; }
}

/**
 * makes a list of profile links.
 * @param {Array<{name: string, avatar?: {url?: string}}>} users
 * @param {HTMLElement} container
 */
function renderUserList(users = [], container) {
  if (!container) return;
  if (!users.length) {
    container.innerHTML = `<li class="list-group-item text-muted">None</li>`;
    return;
  }
  container.innerHTML = users.map((u) => {
    const name = u?.name ?? "(unknown)";
    return `
      <li class="list-group-item py-2">
        <a class="text-decoration-none" href="/profile/index.html?name=${encodeURIComponent(name)}">
          ${esc(name)}
        </a>
      </li>
    `;
  }).join("");
}

async function loadProfile() {
  title.textContent = "Loading…";
  if (postsEl)        postsEl.innerHTML = "";
  if (followersEl)    followersEl.innerHTML = "";
  if (followingEl)    followingEl.innerHTML = "";
  if (followersCount) followersCount.textContent = "";
  if (followingCount) followingCount.textContent = "";

  try {
    const r = await fetchJson(
      `/social/profiles/${encodeURIComponent(viewedName)}?_posts=true&_followers=true&_following=true`
    );
    const p = r?.data;
    if (!p) throw new Error("Profile not found");

    // Header
    title.textContent = p.name;
    const avatar = p.avatar?.url
      ? `<img src="${esc(p.avatar.url)}" alt="avatar" width="80" height="80"
           class="rounded-circle me-2 align-middle">`
      : "";

    info.innerHTML = `
      <div class="d-flex align-items-center mb-1">
        ${avatar}
        <strong class="fs-5">${esc(p.name)}</strong>
      </div>
      <small class="text-muted">
        Followers: ${p._count?.followers ?? 0} • Following: ${p._count?.following ?? 0}
      </small>
    `;

    // Posts (clickable -> single post page) + my own edit/delete
    const userPosts = p.posts ?? [];
    const isMe = (viewedName || "").toLowerCase() === (myName || "").toLowerCase();

    if (postsEl) {
      postsEl.classList.add("list-group"); 
      postsEl.innerHTML = userPosts.length
        ? userPosts.map((x) => `
            <li class="list-group-item d-flex align-items-center justify-content-between" data-id="${x.id}">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <a class="text-decoration-none fw-semibold" href="/post/details/index.html?id=${x.id}">
                  ${esc(x.title || "(untitled)")}
                </a>
                ${x.created ? `<small class="text-muted">• ${fmtDate(x.created)}</small>` : ""}
              </div>
              ${isMe ? `
                <div class="d-flex align-items-center gap-2">
                  <a class="btn btn-sm btn-outline-primary" href="/post/edit/index.html?id=${x.id}">Edit</a>
                  <button class="btn btn-sm btn-outline-danger delete-post-btn" data-id="${x.id}">Delete</button>
                </div>
              ` : ""}
            </li>
          `).join("")
        : `<li class="list-group-item text-muted">No posts yet</li>`;

      if (isMe) {
        postsEl.querySelectorAll(".delete-post-btn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const postId = e.currentTarget.dataset.id;
            if (!confirm("Delete this post?")) return;
            try {
              await fetchJson(`/social/posts/${postId}`, { method: "DELETE" });
              e.currentTarget.closest("li")?.remove();
            } catch (err) {
              console.error(err);
              alert(err?.data?.errors?.[0]?.message || "Failed to delete post");
            }
          });
        });
      }
    }

    // this one manages the Followers & Following lists
    const followers = p.followers ?? [];
    const following = p.following ?? [];
    if (followersCount) followersCount.textContent = `(${followers.length})`;
    if (followingCount) followingCount.textContent = `(${following.length})`;

    if (followersEl) {
      followersEl.classList.add("list-group");
      renderUserList(followers, followersEl);
    }
    if (followingEl) {
      followingEl.classList.add("list-group");
      renderUserList(following, followingEl);
    }

    // That makes the Follow / Unfollow visibile 
    if (viewedName !== myName) {
      const iFollow = !!followers.find((f) => f.name === myName);
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
    if (postsEl)     postsEl.innerHTML = "";
    if (followersEl) followersEl.innerHTML = "";
    if (followingEl) followingEl.innerHTML = "";
  }
}

// this handles the Follow / Unfollow 
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
