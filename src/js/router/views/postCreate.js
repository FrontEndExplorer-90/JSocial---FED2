// src/js/router/views/postCreate.js
import { onCreatePost } from "../../ui/post/create.js";
import authGuard from "../../ui/utilities/authGuard.js"; 

authGuard?.();

const form = document.forms.createPost; 
form?.addEventListener("submit", onCreatePost);

