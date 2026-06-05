import { onRegister } from "../../ui/auth/register.js";

export default function () {
  const form = document.forms.register;

  if (form) {
    form.addEventListener("submit", onRegister);
  }
}