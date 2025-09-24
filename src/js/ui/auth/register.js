// src/js/ui/auth/register.js
import { fetchJson } from "/src/js/api/client.js";

const form = document.querySelector("form[name='register']");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value.trim();        // from your form
  const email = e.target.email.value.trim();      // must match your pattern
  const password = e.target.password.value;

  try {
    // Noroff v2 register
    await fetchJson("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    alert("Registration successful — please log in.");
    location.href = "/auth/login/index.html";
  } catch (err) {
    // v2 errors come as { data: { errors: [{ message }] } }
    const msg = err?.data?.errors?.[0]?.message || "Registration failed";
    alert(msg);
    console.error(err);
  }
});
