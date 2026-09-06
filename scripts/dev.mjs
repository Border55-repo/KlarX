import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "apps", "web");
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const clean = normalize(pathname).replace(/^([/\\])+/, "");
  let file = join(root, clean || "index.html");
  if (!file.startsWith(root) || !existsSync(file)) file = join(root, "index.html");
  response.setHeader("Content-Type", mime[extname(file)] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  createReadStream(file).pipe(response);
}).listen(4173, "127.0.0.1", () => console.log("http://127.0.0.1:4173"));
