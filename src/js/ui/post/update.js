import { fetchJson } from "/src/js/api/client.js";

const token = localStorage.getItem("jsocial_token");
const apiKey = localStorage.getItem("jsocial_apiKey");
if (!token || !apiKey) location.href = "/auth/login/index.html";

const form = document.querySelector("#edit-post");
const params = new URLSearchParams(location.search);
const id = params.get("id");
if (!id) location.href = "/post/index.html";

(async () => {
  try {
    const resp = await fetchJson(`/social/posts/${id}`);
    const post = resp?.data;
    form.title.value = post?.title || "";
    form.body.value  = post?.body  || "";
  } catch (err) {
    alert("Failed to load post");
    console.error(err);
    location.href = "/post/index.html";
  }
})();


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = e.target.title.value.trim();
  const body  = e.target.body.value.trim();

  try {
    await fetchJson(`/social/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, body }),
    });
    alert("Updated!");
    location.href = "/post/index.html";
  } catch (err) {
    console.error(err);
    alert(err?.data?.errors?.[0]?.message || "Failed to update");
  }
});
