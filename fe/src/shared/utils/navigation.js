// fe\src\shared\utils\navigation.js
import { encodePath } from "./routeCipher";

export function navigateTo(path, navigate) {
  navigate("/" + encodePath(path));
}