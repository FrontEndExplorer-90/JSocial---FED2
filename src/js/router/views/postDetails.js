import { authGuard } from "../../utilities/authGuard.js";
import "../../ui/post/details.js";

export default function () {
  authGuard();
}