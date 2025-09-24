import { fetchJson } from "/src/js/api/client.js";

// Auth guard
const token  = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";

// whose profile? If ?name=abc is present, show that user; else show me
const myName = localStorage.getItem("jsocial_name");
const params = new URLSearchParams(location.search);
const name   = params.get("name") || myName;

const title = document.querySelector("#title");
const info  = document.querySelector("#info");
const posts = document.querySelector("#posts");
const followBtn   = document.querySelector("#followBtn");
const unfollowBtn = document.querySelector("#unfollowBtn");

const escapeHtml = (s = "") =>
  s.replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

async function loadProfile() {
  title.textContent = "Loading…";
  try {
    // include posts, followers & following so we can render counts and buttons
    const r = await fetchJson(
      `/social/profiles/${encodeURIComponent(name)}?_posts=true&_followers=true&_following=true`
    );
    const p = r?.data;

    title.textContent = p.name;
    const avatar = p.avatar?.url
      ? `<img src="${escapeHtml(p.avatar.url)}" alt="avatar" width="80" height="80" style="border-radius:50%;">`
      : "";

    info.innerHTML = `
      ${avatar}
      <p><strong>${escapeHtml(p.name)}</strong></p>
      <p>Followers: ${p._count?.followers ?? 0} • Following: ${p._count?.following ?? 0}</p>
    `;

    const myPosts = p.posts ?? [];
    posts.innerHTML = myPosts.length
      ? myPosts.map(x => `<li>${escapeHtml(x.title || "(untitled)")}</li>`).join("")
      : "<li>No posts yet</li>";

    // Follow / Unfollow (only when viewing others)
    if (name !== myName) {
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
    info.textContent = e?.data?.errors?.[0]?.message || "";
  }
}

followBtn?.addEventListener("click", async () => {
  try {
    await fetchJson(`/social/profiles/${encodeURIComponent(name)}/follow`, { method: "PUT" });
    await loadProfile();
  } catch (e) {
    alert(e?.data?.errors?.[0]?.message || "Failed to follow");
  }
});

unfollowBtn?.addEventListener("click", async () => {
  try {
    await fetchJson(`/social/profiles/${encodeURIComponent(name)}/unfollow`, { method: "PUT" });
    await loadProfile();
  } catch (e) {
    alert(e?.data?.errors?.[0]?.message || "Failed to unfollow");
  }
});

loadProfile();
