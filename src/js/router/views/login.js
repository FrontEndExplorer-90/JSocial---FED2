import { onLogin } from "../../ui/auth/login.js";

export default function () {
  const form = document.forms.login;

  if (form) {
    form.addEventListener("submit", onLogin);
  }
}
