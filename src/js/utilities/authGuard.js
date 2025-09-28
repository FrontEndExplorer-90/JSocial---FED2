// src/js/ui/utilities/authGuard.js
export function authGuard() {
  const token = localStorage.getItem("jsocial_token");
  if (!token) {
    alert("You must be logged in to view this page");
    window.location.href = "/auth/login";
  }
}
