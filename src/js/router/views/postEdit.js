import { authGuard } from "../../utilities/authGuard.js";
import "../../ui/post/update.js";

export default function () {
  authGuard();
}