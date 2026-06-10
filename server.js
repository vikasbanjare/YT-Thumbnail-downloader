import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createThumbnailZip, fetchSourceVideos } from "./lib/youtube.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function handleAnalyze(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const input = url.searchParams.get("url") || "";
  const videos = await fetchSourceVideos(input);
  sendJson(response, 200, { videos });
}

async function handleDownload(request, response) {
  let body = "";
  for await (const chunk of request) body += chunk;
  const { url: input } = JSON.parse(body || "{}");
  const { zip } = await createThumbnailZip(input);

  response.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="youtube-thumbnails.zip"`,
    "Content-Length": zip.length,
  });
  response.end(zip);
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname;
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);
  const file = await readFile(filePath);
  response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
  response.end(file);
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.url?.startsWith("/api/analyze")) return await handleAnalyze(request, response);
    if (request.url?.startsWith("/api/download") && request.method === "POST") return await handleDownload(request, response);
    await serveStatic(request, response);
  } catch (error) {
    if (request.url?.startsWith("/api/")) {
      sendJson(response, 400, { error: error.message });
    } else {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  }
});

server.listen(port, () => {
  console.log(`YouTube thumbnail downloader running at http://127.0.0.1:${port}`);
});
