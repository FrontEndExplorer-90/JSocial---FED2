import { fetchJson } from "/src/js/api/client.js";

// check if logged in
const token = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) {
  location.href = "/auth/login/index.html";
}

const form = document.querySelector("#create-post");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = e.target.title.value.trim();
  const body = e.target.body.value.trim();

  try {
    await fetchJson("/social/posts", {
      method: "POST",
      body: JSON.stringify({ title, body }),
    });

    alert("✅ Post created!");
    location.href = "/post/index.html"; // go back to feed
  } catch (err) {
    console.error(err);
    alert(err?.data?.errors?.[0]?.message || "❌ Failed to create post");
  }
});
