import { fetchJson } from "../../api/client.js"; 

export async function onRegister(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
   
    await fetchJson("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    alert("Registration successful — please log in.");
    
    location.href = "/auth/login/index.html";
  } catch (err) {
    const msg = err?.data?.errors?.[0]?.message || "Registration failed";
    alert(msg);
    console.error(err);
  }
}
