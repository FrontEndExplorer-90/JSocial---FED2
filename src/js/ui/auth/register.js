// src/js/ui/auth/register.js
import { fetchJson } from "../../api/client.js"; // use relative path

export async function onRegister(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    // Noroff v2 register
    await fetchJson("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    alert("Registration successful — please log in.");
    // send them to the login page
    location.href = "/auth/login/index.html";
  } catch (err) {
    const msg = err?.data?.errors?.[0]?.message || "Registration failed";
    alert(msg);
    console.error(err);
  }
}
