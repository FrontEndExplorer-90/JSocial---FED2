import { authGuard } from "../../utilities/authGuard.js";
import "../../ui/auth/logout.js";
import "../ui/profile/profile.js";

export default function () {
  authGuard();
}
