// fe\src\shared\utils\routeCipher.js
export function encodePath(
 path = "/"
) {
 try {
  return btoa(path);
 } catch {
  return "";
 }
}

export function decodePath(
 hash = ""
) {
 try {
  return atob(hash);
 } catch {
  return "/";
 }
}

export function isEncodedPath(
 hash = ""
) {
 try {
  return atob(hash)
   .startsWith("/");
 } catch {
  return false;
 }
}