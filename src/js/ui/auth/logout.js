import { setAuth } from "../../api/client.js";


export function onLogout(e) {
  e?.preventDefault?.();

 
  setAuth({ token: "", apiKey: "" });


  try {
    localStorage.removeItem("jsocial_name");

  } catch {}

  
  location.href = "/auth/login/";
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", onLogout);
}

export default onLogout;

