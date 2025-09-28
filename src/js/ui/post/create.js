import { fetchJson, getAuth } from "../../api/client.js";

function parseTags(input) {
  return input
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}

export async function onCreatePost(e) {
  e.preventDefault();

  const form = e.target;
  const title = form.title.value.trim();
  const body = form.body.value.trim();
  const tags = parseTags(form.tags?.value || "");
  const mediaUrl = form.media?.value?.trim();

  try {
    
    const { token } = getAuth?.() || {};
    if (!token) {
      alert("Please log in to create a post.");
      location.href = "/auth/login/";
      return;
    }

    const payload = {
      title,
      body,
      tags,
      ...(mediaUrl ? { media: { url: mediaUrl, alt: title } } : {}),
    };

    await fetchJson("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  
    location.href = "/post/index.html";
  } catch (err) {
    const msg = err?.data?.errors?.[0]?.message || "Could not create post";
    alert(msg);
    console.error(err);
  }
}
