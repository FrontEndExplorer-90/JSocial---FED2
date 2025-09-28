import { onCreatePost } from "../../ui/post/create.js";
import authGuard from "../../utilities/authGuard.js"; 

authGuard?.(); 

const form = document.forms.createPost; 
form?.addEventListener("submit", onCreatePost);
