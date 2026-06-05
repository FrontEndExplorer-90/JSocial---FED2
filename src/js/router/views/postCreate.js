import { onCreatePost } from "../../ui/post/create.js";
import { authGuard } from "../../utilities/authGuard.js";

export default function () {
  authGuard();

  const form = document.forms.createPost;

  if (form) {
    form.addEventListener("submit", onCreatePost);
  }
}