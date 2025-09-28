import { fetchJson, setAuth } from "../../api/client.js"; 

export async function onLogin(e) {
  e.preventDefault();

  const email = e.target.email.value.trim(); 
  const password = e.target.password.value;

  try {
    //login getting token
    const login = await fetchJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = login?.data?.accessToken;

    //stores token immediately so next call has Authorization
    setAuth({ token });

    //creates API key 
    const keyResp = await fetchJson("/auth/create-api-key", {
      method: "POST",
      body: JSON.stringify({ name: "JSocial key" }),
    });
    const apiKey = keyResp?.data?.key;

    //saves both
    setAuth({ token, apiKey });

    //saves username
    const name = login?.data?.name || login?.data?.user?.name;
    localStorage.setItem("jsocial_name", name || "");

    location.href = "/post/index.html";
  } catch (err) {
    alert(err?.data?.errors?.[0]?.message || "Login failed");
    console.error(err);
  }
}

