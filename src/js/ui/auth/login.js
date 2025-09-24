// src/js/ui/auth/login.js
import { fetchJson, setAuth } from "/src/js/api/client.js";

const form = document.querySelector("form[name='login']");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value.trim();   // must be @stud.noroff.no
  const password = e.target.password.value;

  try {
    // 1) Login: get token
    const login = await fetchJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = login?.data?.accessToken;

    // store token immediately so next call has Authorization
    setAuth({ token });

    // 2) Create API key (first time per account; safe to call here)
    const keyResp = await fetchJson("/auth/create-api-key", {
      method: "POST",
      body: JSON.stringify({ name: "JSocial key" }),
    });
    const apiKey = keyResp?.data?.key;

    // save both
    setAuth({ token, apiKey });

    // 👉 NEW: save username (for "my posts" later)
    const name = login?.data?.name || login?.data?.user?.name;
    localStorage.setItem("jsocial_name", name || "");

    // 3) go to feed
    location.href = "/post/index.html";
  } catch (err) {
    alert(err?.data?.errors?.[0]?.message || "Login failed");
    console.error(err);
  }
});
